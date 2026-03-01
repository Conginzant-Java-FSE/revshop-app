import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { ProductDTO, CategoryDTO } from '../../models/product.model';

@Component({
    selector: 'app-inventory',
    templateUrl: './inventory.component.html',
    styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {
    products: ProductDTO[] = [];
    categories: CategoryDTO[] = [];
    loading = true;
    toastMsg = '';

    // Add/Edit Product Form
    showForm = false;
    editingId: number | null = null;
    productName = '';
    productDesc = '';
    mrp: number | null = null;
    sellingPrice: number | null = null;
    stockQuantity: number | null = null;
    thresholdQuantity: number | null = null;
    categoryId: number | null = null;
    submitting = false;

    // Add Category
    showCategoryForm = false;
    newCategoryName = '';
    newCategoryDesc = '';

    constructor(
        private productService: ProductService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.loadProducts();
        this.loadCategories();
    }

    loadProducts(): void {
        this.loading = true;
        this.productService.getAllProducts().subscribe({
            next: (res) => {
                const user = this.authService.getCurrentUser();
                this.products = res.data.filter(p => p.sellerId === user?.userId);
                this.loading = false;
            },
            error: () => { this.loading = false; }
        });
    }

    loadCategories(): void {
        this.productService.getAllCategories().subscribe({
            next: (res) => { this.categories = res.data; }
        });
    }

    openAddForm(): void {
        this.resetForm();
        this.showForm = true;
    }

    editProduct(product: ProductDTO): void {
        this.editingId = product.productId!;
        this.productName = product.name;
        this.productDesc = product.description;
        this.mrp = product.mrp;
        this.sellingPrice = product.sellingPrice;
        this.stockQuantity = product.stockQuantity;
        this.thresholdQuantity = product.thresholdQuantity;
        this.categoryId = product.categoryId;
        this.showForm = true;
    }

    saveProduct(): void {
        const user = this.authService.getCurrentUser();
        if (!user) return;

        this.submitting = true;
        const product: ProductDTO = {
            name: this.productName,
            description: this.productDesc,
            mrp: this.mrp || 0,
            sellingPrice: this.sellingPrice || 0,
            stockQuantity: this.stockQuantity || 0,
            thresholdQuantity: this.thresholdQuantity || 0,
            isActive: true,
            categoryId: this.categoryId || 0,
            sellerId: user.userId
        };

        if (this.editingId) {
            this.productService.updateProduct(this.editingId, product).subscribe({
                next: () => {
                    this.submitting = false;
                    this.showForm = false;
                    this.loadProducts();
                    this.showToast('Product updated!');
                },
                error: () => {
                    this.submitting = false;
                    this.showToast('Failed to update product');
                }
            });
        } else {
            this.productService.createProduct(product).subscribe({
                next: () => {
                    this.submitting = false;
                    this.showForm = false;
                    this.loadProducts();
                    this.showToast('Product created!');
                },
                error: () => {
                    this.submitting = false;
                    this.showToast('Failed to create product');
                }
            });
        }
    }

    deleteProduct(id: number): void {
        if (confirm('Are you sure you want to delete this product?')) {
            this.productService.deleteProduct(id).subscribe({
                next: () => {
                    this.loadProducts();
                    this.showToast('Product deleted!');
                },
                error: () => this.showToast('Failed to delete product')
            });
        }
    }

    addCategory(): void {
        if (!this.newCategoryName.trim()) return;
        this.productService.createCategory({
            name: this.newCategoryName,
            description: this.newCategoryDesc
        }).subscribe({
            next: () => {
                this.showCategoryForm = false;
                this.newCategoryName = '';
                this.newCategoryDesc = '';
                this.loadCategories();
                this.showToast('Category created!');
            },
            error: () => this.showToast('Failed to create category')
        });
    }

    resetForm(): void {
        this.editingId = null;
        this.productName = '';
        this.productDesc = '';
        this.mrp = null;
        this.sellingPrice = null;
        this.stockQuantity = null;
        this.thresholdQuantity = null;
        this.categoryId = null;
    }

    showToast(msg: string): void {
        this.toastMsg = msg;
        setTimeout(() => this.toastMsg = '', 3000);
    }
}
