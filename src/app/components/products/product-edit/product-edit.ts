import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/product';
import { CategoryService, CategoryDTO } from '../../../services/category';
import { ToastService } from '../../../services/toast';
import { Navbar } from '../../shared/navbar/navbar';
import { Header } from '../../shared/header/header';

@Component({
    selector: 'app-product-edit',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, RouterLink, Navbar, Header],
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
            categoryId: ['', [Validators.required]],
            sellerId: [null],
            isActive: [true]
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
        this.productService.updateProduct(this.productId, this.productForm.value).subscribe({
            next: () => {
                this.toastService.success('Product updated successfully!');
                this.router.navigate(['/seller-dashboard']);
            },
            error: (err) => {
                this.loading.set(false);
                this.toastService.error(err.error?.message || 'Failed to update product');
            }
        });
    }
}
