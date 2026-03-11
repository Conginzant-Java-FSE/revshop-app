import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../services/product';
import { CategoryService, CategoryDTO } from '../../services/category';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from '../shared/header/header';
import { ToastService } from '../../services/toast';
import { CATEGORY_FILTERS } from '../../constants/category-filters';

@Component({
    selector: 'app-product-add',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, RouterLink, Header],
    templateUrl: './product-add.html',
    styleUrl: './product-add.css'
})
export class ProductAddComponent implements OnInit {
    productForm!: FormGroup;
    categories = signal<CategoryDTO[]>([]);
    loading = signal<boolean>(false);
    dynamicAttributes = signal<{ name: string, options: string[] }[]>([]);
    primaryImageMode = signal<'file' | 'url'>('file');
    additionalImageModes = signal<Record<number, 'file' | 'url'>>({});
    submitted = false;

    constructor(
        private fb: FormBuilder,
        private productService: ProductService,
        private categoryService: CategoryService,
        private router: Router,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        this.initForm();
        this.loadCategories();

        // Listen for category changes
        this.productForm.get('categoryId')?.valueChanges.subscribe(categoryId => {
            this.onCategoryChange(categoryId);
        });
    }

    private initForm(): void {
        const sellerId = localStorage.getItem('userId');
        this.productForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: ['', [Validators.required]],
            mrp: ['', [Validators.required, Validators.min(1)]],
            sellingPrice: ['', [Validators.required, Validators.min(1)]],
            stockQuantity: ['', [Validators.required, Validators.min(0)]],
            thresholdQuantity: [5, [Validators.required, Validators.min(1)]],
            categoryId: ['', [Validators.required]],
            sellerId: [Number(sellerId), [Validators.required]],
            isActive: [true],
            imageUrl: [''],
            additionalImages: this.fb.array([]),
            attributes: this.fb.group({}),
            videoType: ['YOUTUBE'],
            videoUrl: [''],
            videoFile: [null]
        });
    }

    onCategoryChange(categoryId: any): void {
        const cat = this.categories().find(c => c.categoryId === Number(categoryId));
        if (cat && CATEGORY_FILTERS[cat.name]) {
            const filters = CATEGORY_FILTERS[cat.name];
            this.dynamicAttributes.set(filters);

            const attributesGroup = this.productForm.get('attributes') as FormGroup;
            // Clear existing controls
            Object.keys(attributesGroup.controls).forEach(key => attributesGroup.removeControl(key));

            // Add new controls
            filters.forEach((filter: { name: string, options: string[] }) => {
                attributesGroup.addControl(filter.name, this.fb.control(''));
            });
        } else {
            this.dynamicAttributes.set([]);
            const attributesGroup = this.productForm.get('attributes') as FormGroup;
            Object.keys(attributesGroup.controls).forEach(key => attributesGroup.removeControl(key));
        }
    }

    get additionalImages(): FormArray {
        return this.productForm.get('additionalImages') as FormArray;
    }

    addAdditionalImage(): void {
        this.additionalImages.push(this.fb.control(''));
        const modes = { ...this.additionalImageModes() };
        modes[this.additionalImages.length - 1] = 'file';
        this.additionalImageModes.set(modes);
    }

    removeAdditionalImage(index: number): void {
        this.additionalImages.removeAt(index);
        const modes = { ...this.additionalImageModes() };
        delete modes[index];
        this.additionalImageModes.set(modes);
    }

    setImageMode(isMain: boolean, mode: 'file' | 'url', index?: number): void {
        if (isMain) {
            this.primaryImageMode.set(mode);
        } else if (index !== undefined) {
            const modes = { ...this.additionalImageModes() };
            modes[index] = mode;
            this.additionalImageModes.set(modes);
        }
    }

    onFileSelected(event: Event, isMain: boolean, index?: number): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            this.uploadFile(file, isMain, index);
        }
    }

    onVideoFileSelected(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            this.loading.set(true);
            this.productService.uploadImage(file).subscribe({
                next: (res: any) => {
                    const url = res.url || res.data?.url;
                    this.productForm.get('videoUrl')?.setValue(url);
                    this.toastService.success('Video uploaded successfully');
                    this.loading.set(false);
                },
                error: (err) => {
                    this.toastService.error('Failed to upload video');
                    this.loading.set(false);
                }
            });
        }
    }

    private uploadFile(file: File, isMain: boolean, index?: number): void {
        this.loading.set(true);
        this.productService.uploadImage(file).subscribe({
            next: (res: any) => {
                const url = res.url || res.data?.url;
                if (isMain) {
                    this.productForm.get('imageUrl')?.setValue(url);
                } else if (index !== undefined) {
                    this.additionalImages.at(index).setValue(url);
                }
                this.toastService.success('Image uploaded successfully');
                this.loading.set(false);
            },
            error: (err) => {
                this.toastService.error('Failed to upload image');
                this.loading.set(false);
            }
        });
    }

    loadCategories(): void {
        this.categoryService.getAllCategories().subscribe({
            next: (res) => this.categories.set(res.data),
            error: (err) => console.error('Failed to load categories', err)
        });
    }

    onSubmit(): void {
        this.submitted = true;
        if (this.productForm.invalid) {
            this.toastService.error('Please fill all required fields correctly');
            return;
        }

        this.loading.set(true);
        const formValue = { ...this.productForm.value };
        const videoUrl = formValue.videoUrl;
        const videoType = formValue.videoType;
        
        // Remove video fields from main product payload
        delete formValue.videoUrl;
        delete formValue.videoType;
        delete formValue.videoFile;

        this.productService.createProduct(formValue).subscribe({
            next: (res) => {
                const productId = res.data.productId;
                if (productId && videoUrl) {
                    this.productService.addProductVideo(productId, videoUrl, videoType).subscribe({
                        next: () => {
                            this.toastService.success('Product and video added successfully!');
                            this.router.navigate(['/seller-dashboard']);
                        },
                        error: () => {
                            this.toastService.warning('Product added, but video failed to save');
                            this.router.navigate(['/seller-dashboard']);
                        }
                    });
                } else {
                    this.toastService.success('Product added successfully!');
                    this.router.navigate(['/seller-dashboard']);
                }
            },
            error: (err) => {
                this.loading.set(false);
                this.toastService.error(err.error?.message || 'Failed to add product');
            }
        });
    }
}
