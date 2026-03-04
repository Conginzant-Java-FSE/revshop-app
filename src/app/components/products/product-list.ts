import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, ProductDTO } from '../../services/product';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { CartService } from '../../services/cart';
import { ToastService } from '../../services/toast';

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './product-list.html',
    styleUrl: './product-list.css'
})
export class ProductListComponent implements OnInit {
    products = signal<ProductDTO[]>([]);
    keyword = signal<string>('');
    minPrice = signal<number | undefined>(undefined);
    maxPrice = signal<number | undefined>(undefined);
    loading = signal<boolean>(false);

    // Pagination
    currentPage = signal<number>(0);
    totalPages = signal<number>(0);
    totalElements = signal<number>(0);
    pageSize = 12;

    // Sort
    sortOption = signal<string>('productId_asc');

    constructor(
        private productService: ProductService,
        private cartService: CartService,
        private toastService: ToastService,
        private location: Location
    ) { }

    goBack(): void {
        this.location.back();
    }

    ngOnInit(): void {
        this.loadProducts();
    }

    private getSortParams(): { sortBy: string; direction: string } {
        const [sortBy, direction] = this.sortOption().split('_');
        return { sortBy, direction };
    }

    loadProducts(): void {
        this.loading.set(true);
        const { sortBy, direction } = this.getSortParams();
        this.productService.getAllProducts(this.currentPage(), this.pageSize, sortBy, direction).subscribe({
            next: (res) => {
                this.products.set(res.data.content);
                this.totalPages.set(res.data.totalPages);
                this.totalElements.set(res.data.totalElements);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    onSearch(): void {
        if (!this.keyword().trim()) {
            this.currentPage.set(0);
            this.loadProducts();
            return;
        }
        this.loading.set(true);
        this.productService.searchProducts(this.keyword(), this.currentPage(), this.pageSize).subscribe({
            next: (res) => {
                this.products.set(res.data.content);
                this.totalPages.set(res.data.totalPages);
                this.totalElements.set(res.data.totalElements);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    onFilter(): void {
        this.loading.set(true);
        this.currentPage.set(0);
        this.productService.filterProducts({
            minPrice: this.minPrice(),
            maxPrice: this.maxPrice()
        }, this.currentPage(), this.pageSize).subscribe({
            next: (res) => {
                this.products.set(res.data.content);
                this.totalPages.set(res.data.totalPages);
                this.totalElements.set(res.data.totalElements);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    onSortChange(): void {
        this.currentPage.set(0);
        this.loadProducts();
    }

    goToPage(page: number): void {
        if (page >= 0 && page < this.totalPages()) {
            this.currentPage.set(page);
            this.loadProducts();
        }
    }

    previousPage(): void {
        this.goToPage(this.currentPage() - 1);
    }

    nextPage(): void {
        this.goToPage(this.currentPage() + 1);
    }

    addToCart(product: ProductDTO): void {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            this.toastService.success('Please login to add items to cart');
            return;
        }
        this.cartService.addItemToCart(Number(userId), product.productId!, 1).subscribe({
            next: () => this.toastService.success('Product added to cart!'),
            error: (err) => console.error(err)
        });
    }
}
