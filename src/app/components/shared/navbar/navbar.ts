import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../services/cart.service';
import { CartItem } from '../../../models/cart-item.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar implements OnInit {
  totalCartItems: number = 0;

  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.loadCartCount();
  }

  loadCartCount(): void {
    this.cartService.getCartItems().subscribe({
      next: (items: CartItem[]) => {
        this.totalCartItems = 0;
        items.forEach((item: CartItem) => {
          this.totalCartItems += item.quantity;
        });
      },
      error: () => {
        this.totalCartItems = 0;
      }
    });
  }
}
