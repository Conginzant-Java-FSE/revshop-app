import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService, ProductDTO } from '../../services/product';
import { CartService } from '../../services/cart';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './product-detail.html',
    styleUrl: './product-detail.css'
})
export class ProductDetailComponent implements OnInit {
    product = signal<ProductDTO | null>(null);
    quantity = signal<number>(1);
    loading = signal<boolean>(true);

    constructor(
        private route: ActivatedRoute,
        private productService: ProductService,
        private cartService: CartService,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadProduct(Number(id));
        }
    }

    loadProduct(id: number): void {
        this.productService.getProductById(id).subscribe({
            next: (res) => {
                this.product.set(res.data);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    addToCart(): void {
        const userId = localStorage.getItem('userId');
        const prod = this.product();
        if (!userId) {
            alert('Please login to add items to cart');
            return;
        }
        if (prod && prod.productId) {
            this.cartService.addItemToCart(Number(userId), prod.productId, this.quantity()).subscribe({
                next: () => this.toastService.success('Product added to cart!'),
                error: (err) => console.error(err)
            });
        }
    }

    incrementQty(): void {
        const prod = this.product();
        if (prod && this.quantity() < prod.stockQuantity) {
            this.quantity.set(this.quantity() + 1);
        }
    }

    decrementQty(): void {
        if (this.quantity() > 1) {
            this.quantity.set(this.quantity() - 1);
        }
    }
}
