import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, OrderResponseDTO } from '../../services/order';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-order-list',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './order-list.html',
    styleUrl: './order-list.css'
})
export class OrderListComponent implements OnInit {
    orders = signal<OrderResponseDTO[]>([]);
    loading = signal<boolean>(true);

    constructor(private orderService: OrderService) { }

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
}
