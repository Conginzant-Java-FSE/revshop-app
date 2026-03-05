import { Component, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService, ProductDTO } from '../../services/product';
import { OrderService } from '../../services/order';
import { ToastService } from '../../services/toast';
import { ShipperService, ShipperDTO } from '../../services/shipper.service';
import { Header } from '../shared/header/header';
import { FormsModule } from '@angular/forms';
import { ApiResponse } from '../../models/api-response.model';


@Component({
    selector: 'app-seller-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink, Header, FormsModule],
    templateUrl: './seller-dashboard.html',
    styleUrl: './dashboard.css'
})
export class SellerDashboardComponent implements OnInit {
    myProducts = signal<ProductDTO[]>([]);
    loadingProducts = signal<boolean>(true);

    stats = signal<any>(null);
    loadingStats = signal<boolean>(true);

    // Orders
    sellerOrders = signal<any[]>([]);
    loadingOrders = signal<boolean>(true);

    // Shipper Assignment
    availableShippers = signal<ShipperDTO[]>([]);
    showShipperModal = signal<boolean>(false);
    selectedShipperId = signal<number | null>(null);
    assigningOrderId = signal<number | null>(null);
    assigningShipper = signal<boolean>(false);

    sellerId!: number;

    constructor(
        public authService: AuthService,
        private router: Router,
        private productService: ProductService,
        private orderService: OrderService,
        private toastService: ToastService,
        private shipperService: ShipperService
    ) { }

    ngOnInit(): void {
        this.sellerId = Number(localStorage.getItem('userId'));
        this.loadProducts();
        this.loadStats();
        this.loadSellerOrders();
    }

    loadProducts(): void {
        this.loadingProducts.set(true);
        this.productService.getProductsBySeller(this.sellerId).subscribe({
            next: (res: ApiResponse<any>) => {
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
            next: (res: ApiResponse<any>) => {
                this.stats.set(res.data);
                this.loadingStats.set(false);
            },
            error: () => {
                this.loadingStats.set(false);
            }
        });
    }

    loadSellerOrders(): void {
        this.loadingOrders.set(true);
        this.orderService.getSellerOrders(this.sellerId).subscribe({
            next: (res: ApiResponse<any[]>) => {
                this.sellerOrders.set(res.data ?? []);
                this.loadingOrders.set(false);
            },
            error: () => {
                this.loadingOrders.set(false);
                this.toastService.error('Failed to load orders');
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

    // Shipper Assignment
    openShipperModal(orderId: number): void {
        this.assigningOrderId.set(orderId);
        this.selectedShipperId.set(null);
        this.showShipperModal.set(true);
        this.shipperService.getAvailableShippers().subscribe({
            next: (res) => this.availableShippers.set(res.data ?? []),
            error: () => this.toastService.error('Failed to load shippers')
        });
    }

    closeShipperModal(): void {
        this.showShipperModal.set(false);
        this.assigningOrderId.set(null);
        this.selectedShipperId.set(null);
    }

    confirmAssignShipper(): void {
        const shipperId = this.selectedShipperId();
        const orderId = this.assigningOrderId();
        if (!shipperId || !orderId) {
            this.toastService.error('Please select a shipper');
            return;
        }

        this.assigningShipper.set(true);
        this.shipperService.assignShipper(shipperId, orderId).subscribe({
            next: () => {
                this.toastService.success('Shipper assigned successfully!');
                this.assigningShipper.set(false);
                this.closeShipperModal();
                this.loadSellerOrders();
                this.loadStats();
            },
            error: () => {
                this.toastService.error('Failed to assign shipper');
                this.assigningShipper.set(false);
            }
        });
    }

    acceptReturn(orderId: number): void {
        this.orderService.updateOrderStatus(orderId, 'RETURN_APPROVED', this.sellerId).subscribe({
            next: () => {
                this.toastService.success('Return accepted');
                this.loadSellerOrders();
                this.loadStats();
            },
            error: () => this.toastService.error('Failed to accept return')
        });
    }

    rejectReturn(orderId: number): void {
        this.orderService.updateOrderStatus(orderId, 'RETURN_REJECTED', this.sellerId).subscribe({
            next: () => {
                this.toastService.success('Return rejected');
                this.loadSellerOrders();
                this.loadStats();
            },
            error: () => this.toastService.error('Failed to reject return')
        });
    }

    onLogout(): void {
        this.authService.logout();
        this.router.navigate(['/']);
    }
}
