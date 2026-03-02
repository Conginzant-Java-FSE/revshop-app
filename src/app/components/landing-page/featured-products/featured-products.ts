import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-featured-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './featured-products.html',
  styleUrl: './featured-products.css',
})
export class FeaturedProducts {
  successMessage: string = '';

  constructor(private cartService: CartService, private router: Router) { }

  addToCart(productId: number): void {
    this.cartService.addToCart(productId, 1).subscribe({
      next: () => {
        this.successMessage = 'Item added to cart!';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err: any) => {
        console.error('Failed to add to cart', err);
        this.successMessage = 'Failed to add item to cart.';
        setTimeout(() => this.successMessage = '', 3000);
      }
    });
  }

  viewReviews(productId: number): void {
    this.router.navigate(['/reviews', productId]);
  }
}
