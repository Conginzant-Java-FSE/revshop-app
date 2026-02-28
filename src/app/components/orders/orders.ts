import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { OrderResponse } from '../../models/order.model';

@Component({
    selector: 'app-orders',
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
    orders: OrderResponse[] = [];
    loading = true;
    toastMsg = '';

    constructor(
        private orderService: OrderService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.loadOrders();
    }

    loadOrders(): void {
        const user = this.authService.getCurrentUser();
        if (!user) return;

        this.orderService.getUserOrders(user.userId).subscribe({
            next: (res) => {
                const list = res.data || [];
                // Sort by date descending
                this.orders = list.sort((a, b) =>
                    new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
                );
                this.loading = false;
            },
            error: () => { this.loading = false; }
        });
    }

    cancelOrder(orderId: number): void {
        const user = this.authService.getCurrentUser();
        if (!user) return;

        this.orderService.cancelOrder(orderId, user.userId).subscribe({
            next: () => {
                this.showToast('Order cancelled successfully');
                this.loadOrders();
            },
            error: () => this.showToast('Failed to cancel order')
        });
    }

    getStatusClass(status: string): string {
        switch (status?.toUpperCase()) {
            case 'PENDING': return 'status-pending';
            case 'CONFIRMED': return 'status-confirmed';
            case 'SHIPPED': return 'status-shipped';
            case 'DELIVERED': return 'status-delivered';
            case 'CANCELLED': return 'status-cancelled';
            default: return '';
        }
    }

    showToast(msg: string): void {
        this.toastMsg = msg;
        setTimeout(() => this.toastMsg = '', 3000);
    }
}
