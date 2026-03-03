import { Component, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService, ProductDTO } from '../../services/product';
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
    userName = signal<string | null>('');
    myProducts = signal<ProductDTO[]>([]);
    loading = signal<boolean>(true);

    constructor(
        public authService: AuthService,
        private router: Router,
        private productService: ProductService
    ) { }

    ngOnInit(): void {
        this.loadSellerData();
    }

    loadSellerData(): void {
        this.productService.getAllProducts().subscribe({
            next: (res) => {
                const sellerId = localStorage.getItem('userId');
                this.myProducts.set(res.data.content.filter(p => p.sellerId === Number(sellerId)));
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    onLogout(): void {
        this.authService.logout();
        this.router.navigate(['/']);
    }
}
