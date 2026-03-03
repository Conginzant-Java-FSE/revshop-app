import { Component, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrderService, OrderResponseDTO } from '../../services/order';
import { Navbar } from '../shared/navbar/navbar';
import { Header } from '../shared/header/header';

@Component({
    selector: 'app-buyer-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink, Navbar, Header],
    templateUrl: './buyer-dashboard.html',
    styleUrl: './dashboard.css'
})
export class BuyerDashboardComponent implements OnInit {
    userName = signal<string | null>('');
    recentOrders = signal<OrderResponseDTO[]>([]);
    loading = signal<boolean>(true);

    constructor(
        public authService: AuthService,
        private router: Router,
        private orderService: OrderService
    ) { }

    ngOnInit(): void {
        this.loadBuyerData();
    }

    loadBuyerData(): void {
        const userId = localStorage.getItem('userId');
        if (userId) {
            this.orderService.getOrdersByUserId(Number(userId)).subscribe({
                next: (res) => {
                    this.recentOrders.set(res.data.slice(0, 5));
                    this.loading.set(false);
                },
                error: () => this.loading.set(false)
            });
        }
    }

    onLogout(): void {
        this.authService.logout();
        this.router.navigate(['/']);
    }
}
