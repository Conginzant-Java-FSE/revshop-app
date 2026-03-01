import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './product-list.html',
    styleUrl: './product-list.css',
})
export class ProductListComponent implements OnInit, OnDestroy {
    products: Product[] = [];
    loading = true;
    errorMessage = '';

    private routeSub: Subscription | null = null;

    constructor(
        private route: ActivatedRoute,
        private productService: ProductService,
        private cartService: CartService
    ) { }

    ngOnInit(): void {
        this.routeSub = this.route.queryParams.subscribe((params) => {
            this.loading = true;
            this.errorMessage = '';
            this.products = [];

            if (params['search']) {
                this.productService.searchProducts(params['search']).subscribe({
                    next: (data) => {
                        this.products = data;
                        this.loading = false;
                    },
                    error: () => {
                        this.errorMessage = 'Failed to load search results. Please try again.';
                        this.loading = false;
                    },
                });
            } else if (params['category']) {
                this.productService.getProductsByCategory(Number(params['category'])).subscribe({
                    next: (data) => {
                        this.products = data;
                        this.loading = false;
                    },
                    error: () => {
                        this.errorMessage = 'Failed to load category products. Please try again.';
                        this.loading = false;
                    },
                });
            } else {
                this.productService.getAllProducts().subscribe({
                    next: (data) => {
                        this.products = data;
                        this.loading = false;
                    },
                    error: () => {
                        this.errorMessage = 'Failed to load products. Please try again.';
                        this.loading = false;
                    },
                });
            }
        });
    }

    ngOnDestroy(): void {
        this.routeSub?.unsubscribe();
    }

    getDiscount(product: Product): number {
        if (product.mrp <= 0) return 0;
        return Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100);
    }

    isSoldOut(product: Product): boolean {
        return product.stockQuantity === 0;
    }

    addToCart(product: Product): void {
        if (!this.isSoldOut(product)) {
            this.cartService.addToCart({
                productId: product.productId,
                productName: product.name,
                imageUrl: '',
                price: product.sellingPrice
            });
        }
    }
}
