import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { ProductDTO, CategoryDTO } from '../../models/product.model';
import { OrderResponse } from '../../models/order.model';

@Component({
    selector: 'app-seller-dashboard',
    templateUrl: './seller-dashboard.component.html',
    styleUrls: ['./seller-dashboard.component.css']
})
export class SellerDashboardComponent implements OnInit {
    products: ProductDTO[] = [];
    loading = true;
    toastMsg = '';

    // Seller Orders
    sellerOrders: OrderResponse[] = [];
    ordersLoading = false;
    statusOptions = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    updatingStatus: { [orderId: number]: boolean } = {};

    constructor(
        private productService: ProductService,
        private authService: AuthService,
        private orderService: OrderService
    ) { }

    ngOnInit(): void {
        this.loadProducts();
        this.loadSellerOrders();
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

    loadSellerOrders(): void {
        const user = this.authService.getCurrentUser();
        if (!user) return;
        this.ordersLoading = true;
        this.orderService.getSellerOrders(user.userId).subscribe({
            next: (res) => { this.sellerOrders = res.data || []; this.ordersLoading = false; },
            error: () => { this.ordersLoading = false; }
        });
    }

    updateOrderStatus(order: OrderResponse, status: string): void {
        const user = this.authService.getCurrentUser();
        if (!user) return;
        this.updatingStatus[order.orderId] = true;
        this.orderService.updateOrderStatus(order.orderId, status, user.userId).subscribe({
            next: (res) => {
                order.status = res.data.status;
                this.updatingStatus[order.orderId] = false;
                this.showToast('Order status updated to ' + status);
            },
            error: () => {
                this.updatingStatus[order.orderId] = false;
                this.showToast('Failed to update status');
            }
        });
    }

    get inStockCount(): number {
        return this.products.filter(p => p.stockQuantity > 0).length;
    }

    get lowStockCount(): number {
        return this.products.filter(p => p.stockQuantity <= p.thresholdQuantity).length;
    }

    showToast(msg: string): void {
        this.toastMsg = msg;
        setTimeout(() => this.toastMsg = '', 3000);
    }
}

