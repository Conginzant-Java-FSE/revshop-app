import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, OrderResponseDTO } from '../../services/order';
import { Router, RouterLink } from '@angular/router';
import { TrackingModalComponent } from './tracking-modal/tracking-modal';

@Component({
    selector: 'app-order-list',
    standalone: true,
    imports: [CommonModule, RouterLink, TrackingModalComponent],
    templateUrl: './order-list.html',
    styleUrl: './order-list.css'
})
export class OrderListComponent implements OnInit {
    orders = signal<OrderResponseDTO[]>([]);
    loading = signal<boolean>(true);
    showTrackingModal = signal<boolean>(false);
    selectedOrder = signal<{ id: number, number: string } | null>(null);

    constructor(private orderService: OrderService, private router: Router) { }

    ngOnInit(): void {
        this.loadOrders();
    }

    loadOrders(): void {
        const userId = localStorage.getItem('userId');
        if (userId) {
            this.orderService.getOrdersByUserId(Number(userId)).subscribe({
                next: (res) => {
                    this.orders.set(res.data);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false)
            });
        } else {
            this.loading.set(false);
        }
    }

    getStatusClass(status: string): string {
        switch (status.toUpperCase()) {
            case 'PENDING': return 'bg-warning-subtle text-warning-emphasis';
            case 'SHIPPED': return 'bg-info-subtle text-info-emphasis';
            case 'DELIVERED': return 'bg-success-subtle text-success-emphasis';
            case 'CANCELLED': return 'bg-danger-subtle text-danger-emphasis';
            default: return 'bg-secondary-subtle text-secondary-emphasis';
        }
    }

    openTracking(order: OrderResponseDTO): void {
        this.selectedOrder.set({ id: order.orderId, number: order.orderNumber });
        this.showTrackingModal.set(true);
    }

    closeTracking(): void {
        this.showTrackingModal.set(false);
        this.selectedOrder.set(null);
    }

    viewOrderDetail(orderId: number): void {
        this.router.navigate(['/orders', orderId]);
    }
}
