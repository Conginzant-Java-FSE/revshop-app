import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/product';
import { CategoryService, CategoryDTO } from '../../../services/category';
import { ToastService } from '../../../services/toast';
import { Header } from '../../shared/header/header';

@Component({
    selector: 'app-product-edit',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, RouterLink, Header],
    templateUrl: './product-edit.html',
    styleUrl: './product-edit.css'
})
export class ProductEditComponent implements OnInit {
    productForm!: FormGroup;
    categories = signal<CategoryDTO[]>([]);
    loading = signal<boolean>(false);
    fetching = signal<boolean>(true);
    submitted = false;
    productId!: number;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private productService: ProductService,
        private categoryService: CategoryService,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        this.productId = Number(this.route.snapshot.paramMap.get('id'));
        this.initForm();
        this.loadCategories();
        this.loadProduct();
    }

    private initForm(): void {
        this.productForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: ['', [Validators.required]],
            mrp: ['', [Validators.required, Validators.min(1)]],
            sellingPrice: ['', [Validators.required, Validators.min(1)]],
            stockQuantity: ['', [Validators.required, Validators.min(0)]],
            thresholdQuantity: [5, [Validators.required, Validators.min(1)]],
            imageUrl: [''],
            additionalImages: this.fb.array([]),
            categoryId: ['', [Validators.required]],
            sellerId: [null],
            isActive: [true],
            videoType: ['YOUTUBE'],
            videoUrl: ['']
        });
    }

    get additionalImages(): FormArray {
        return this.productForm.get('additionalImages') as FormArray;
    }

    addAdditionalImage(url: string = ''): void {
        this.additionalImages.push(this.fb.control(url));
    }

    removeAdditionalImage(index: number): void {
        this.additionalImages.removeAt(index);
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

    loadProduct(): void {
        this.productService.getProductById(this.productId).subscribe({
            next: (res) => {
                const p = res.data;
                this.productForm.patchValue({
                    name: p.name,
                    description: p.description,
                    mrp: p.mrp,
                    sellingPrice: p.sellingPrice,
                    stockQuantity: p.stockQuantity,
                    thresholdQuantity: p.thresholdQuantity,
                    imageUrl: p.imageUrl,
                    categoryId: p.categoryId,
                    sellerId: p.sellerId,
                    isActive: p.isActive
                });
                // Read and set existing additional images
                if (p.additionalImages && p.additionalImages.length > 0) {
                    p.additionalImages.forEach((img: string) => this.addAdditionalImage(img));
                }
                this.productService.getProductVideos(this.productId).subscribe({
                    next: (vRes) => {
                        if (vRes.data && vRes.data.length > 0) {
                            const video = vRes.data[0];
                            this.productForm.patchValue({
                                videoType: video.videoType,
                                videoUrl: video.videoUrl
                            });
                        }
                    }
                });
                this.fetching.set(false);
            },
            error: () => {
                this.toastService.error('Failed to load product');
                this.fetching.set(false);
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

        delete formValue.videoUrl;
        delete formValue.videoType;

        this.productService.updateProduct(this.productId, formValue).subscribe({
            next: () => {
                if (videoUrl) {
                    this.productService.addProductVideo(this.productId, videoUrl, videoType).subscribe({
                        next: () => {
                            this.toastService.success('Product updated successfully!');
                            this.router.navigate(['/seller-dashboard']);
                        },
                        error: () => {
                            this.toastService.warning('Product updated, but video failed to save');
                            this.router.navigate(['/seller-dashboard']);
                        }
                    });
                } else {
                    this.toastService.success('Product updated successfully!');
                    this.router.navigate(['/seller-dashboard']);
                }
            },
            error: (err) => {
                this.loading.set(false);
                this.toastService.error(err.error?.message || 'Failed to update product');
            }
        });
    }
}
