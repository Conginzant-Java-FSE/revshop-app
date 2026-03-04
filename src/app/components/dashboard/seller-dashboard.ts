import { Component, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService, ProductDTO } from '../../services/product';
import { OrderService } from '../../services/order';
import { ToastService } from '../../services/toast';
import { Navbar } from '../shared/navbar/navbar';
import { Header } from '../shared/header/header';

@Component({
    selector: 'app-seller-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink, Navbar, Header],
    templateUrl: './seller-dashboard.html',
    styleUrl: './dashboard.css'
})
export class SellerDashboardComponent implements OnInit {
    myProducts = signal<ProductDTO[]>([]);
    loadingProducts = signal<boolean>(true);

    stats = signal<any>(null);
    loadingStats = signal<boolean>(true);

    sellerId!: number;

    constructor(
        public authService: AuthService,
        private router: Router,
        private productService: ProductService,
        private orderService: OrderService,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        this.sellerId = Number(localStorage.getItem('userId'));
        this.loadProducts();
        this.loadStats();
    }

    loadProducts(): void {
        this.loadingProducts.set(true);
        this.productService.getProductsBySeller(this.sellerId).subscribe({
            next: (res) => {
                this.myProducts.set(res.data?.content ?? []);
                this.loadingProducts.set(false);
            },
            error: () => {
                this.loadingProducts.set(false);
                this.toastService.error('Failed to load products');
            }
        });
    }

    loadStats(): void {
        this.loadingStats.set(true);
        this.orderService.getSellerStats(this.sellerId).subscribe({
            next: (res) => {
                this.stats.set(res.data);
                this.loadingStats.set(false);
            },
            error: () => {
                this.loadingStats.set(false);
            }
        });
    }

    editProduct(productId: number): void {
        this.router.navigate(['/products/edit', productId]);
    }

    toggleActive(product: ProductDTO): void {
        this.productService.toggleActive(product.productId!).subscribe({
            next: () => {
                const label = product.isActive ? 'deactivated' : 'activated';
                this.toastService.success(`Product ${label} successfully`);
                this.loadProducts();
            },
            error: () => this.toastService.error('Failed to toggle product status')
        });
    }

    deleteProduct(product: ProductDTO): void {
        if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
        this.productService.deleteProduct(product.productId!).subscribe({
            next: () => {
                this.toastService.success('Product deleted');
                this.loadProducts();
            },
            error: () => this.toastService.error('Failed to delete product')
        });
    }

    statusEntries(): { key: string; value: number }[] {
        const s = this.stats();
        if (!s?.ordersByStatus) return [];
        return Object.entries(s.ordersByStatus).map(([key, value]) => ({ key, value: value as number }));
    }

    onLogout(): void {
        this.authService.logout();
        this.router.navigate(['/']);
    }
}
