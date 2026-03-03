import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../../services/cart';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';

@Component({
  selector: 'app-featured-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './featured-products.html',
  styleUrl: './featured-products.css',
})
export class FeaturedProducts {
  successMessage: string = '';

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) { }

  addToCart(productId: number): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.toastService.success('Please login to add items to cart');
      this.router.navigate(['/login']);
      return;
    }
    this.cartService.addItemToCart(Number(userId), productId, 1).subscribe({
      next: () => {
        this.toastService.success('Item added to cart!');
      },
      error: (err: any) => {
        console.error('Failed to add to cart', err);
      }
    });
  }

  viewReviews(productId: number): void {
    this.router.navigate(['/reviews', productId]);
  }
}
