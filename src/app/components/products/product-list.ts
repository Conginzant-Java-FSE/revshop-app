import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, ProductDTO } from '../../services/product';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common'; // Added this
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

    constructor(
        private productService: ProductService,
        private cartService: CartService,
        private toastService: ToastService,
        private location: Location // Added this
    ) { }

    goBack(): void {
        this.location.back();
    }

    ngOnInit(): void {
        this.loadProducts();
    }

    loadProducts(): void {
        this.loading.set(true);
        this.productService.getAllProducts().subscribe({
            next: (res) => {
                this.products.set(res.data.content);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    onSearch(): void {
        if (!this.keyword().trim()) {
            this.loadProducts();
            return;
        }
        this.loading.set(true);
        this.productService.searchProducts(this.keyword()).subscribe({
            next: (res) => {
                this.products.set(res.data.content);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    onFilter(): void {
        this.loading.set(true);
        this.productService.filterProducts({
            minPrice: this.minPrice(),
            maxPrice: this.maxPrice()
        }).subscribe({
            next: (res) => {
                this.products.set(res.data.content);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    addToCart(product: ProductDTO): void {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            this.toastService.success('Please login to add items to cart');
            return;
        }
        this.cartService.addItemToCart(Number(userId), product.productId!, 1).subscribe({
            next: () => this.toastService.success('Product added to cart!'),
            error: (err) => console.error(err) // Error handled by interceptor
        });
    }
}
