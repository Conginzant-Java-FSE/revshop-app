import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TrackingModalComponent } from './tracking-modal/tracking-modal';
import { OrderService } from '../../services/order';
import { AuthService } from '../../services/auth';

@Component({
    selector: 'app-order-list',
    standalone: true,
    imports: [CommonModule, RouterModule, TrackingModalComponent],
    templateUrl: './order-list.html',
    styleUrl: './order-list.css'
})
export class OrderListComponent implements OnInit {
    orders = signal<any[]>([]);
    loading = signal<boolean>(false);
    showTrackingModal = signal<boolean>(false);
    selectedOrder = signal<any>(null);

    constructor(
        private orderService: OrderService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.loadOrders();
    }

    loadOrders(): void {
        const userId = this.authService.authState().userId;
        if (userId) {
            this.loading.set(true);
            this.orderService.getOrdersByUserId(Number(userId)).subscribe({
                next: (res: any) => {
                    this.orders.set(res.data || []);
                    this.loading.set(false);
                },
                error: () => {
                    this.loading.set(false);
                }
            });
        }
    }

    getStatusClass(status: string): string {
        switch (status.toLowerCase()) {
            case 'delivered': return 'bg-success-subtle text-success';
            case 'shipped': return 'bg-info-subtle text-info';
            case 'processing': return 'bg-warning-subtle text-warning';
            case 'cancelled': return 'bg-danger-subtle text-danger';
            default: return 'bg-secondary-subtle text-secondary';
        }
    }

    openTracking(order: any): void {
        this.selectedOrder.set({
            id: order.orderId,
            number: order.orderNumber
        });
        this.showTrackingModal.set(true);
    }

    closeTracking(): void {
        this.showTrackingModal.set(false);
        this.selectedOrder.set(null);
    }
}
