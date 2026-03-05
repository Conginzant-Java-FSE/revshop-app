import { Component, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrderService, OrderResponseDTO } from '../../services/order';
import { ProductService, ProductDTO } from '../../services/product';
import { ApiResponse } from '../../models/api-response.model';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  userName = signal<string | null>('');
  userRole = signal<string | null>('');
  recentOrders = signal<OrderResponseDTO[]>([]);
  myProducts = signal<ProductDTO[]>([]);
  loading = signal<boolean>(true);

  constructor(
    public authService: AuthService,
    private router: Router,
    private orderService: OrderService,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    const role = this.authService.userRole();
    if (role === 'BUYER') {
      this.router.navigate(['/buyer-dashboard']);
    } else if (role === 'SELLER') {
      this.router.navigate(['/seller-dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
