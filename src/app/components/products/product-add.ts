import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../services/product';
import { CategoryService, CategoryDTO } from '../../services/category';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from '../shared/header/header';
import { ToastService } from '../../services/toast';

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
            imageUrl: ['']
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
        this.productService.createProduct(this.productForm.value).subscribe({
            next: () => {
                this.toastService.success('Product added successfully!');
                this.router.navigate(['/seller-dashboard']);
            },
            error: (err) => {
                this.loading.set(false);
                this.toastService.error(err.error?.message || 'Failed to add product');
            }
        });
    }
}
