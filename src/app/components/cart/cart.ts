import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart-item.model';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './cart.html',
    styleUrl: './cart.css'
})
export class CartComponent implements OnInit {
    cartItems: CartItem[] = [];
    errorMessage: string = '';
    loading: boolean = false;

    constructor(private cartService: CartService) { }

    ngOnInit(): void {
        this.loadCartItems();
    }

    loadCartItems(): void {
        this.loading = true;
        this.errorMessage = '';
        this.cartService.getCartItems().subscribe({
            next: (items: CartItem[]) => {
                this.cartItems = items;
                this.loading = false;
            },
            error: (err: any) => {
                console.error('Failed to load cart items', err);
                this.errorMessage = 'Unable to load cart. Please try again later.';
                this.loading = false;
            }
        });
    }

    increaseQuantity(item: CartItem): void {
        this.cartService.updateQuantity(item.id, item.quantity + 1).subscribe({
            next: () => this.loadCartItems(),
            error: (err: any) => console.error('Failed to increase quantity', err)
        });
    }

    decreaseQuantity(item: CartItem): void {
        if (item.quantity > 1) {
            this.cartService.updateQuantity(item.id, item.quantity - 1).subscribe({
                next: () => this.loadCartItems(),
                error: (err: any) => console.error('Failed to decrease quantity', err)
            });
        }
    }

    removeItem(id: number): void {
        this.cartService.removeItem(id).subscribe({
            next: () => this.loadCartItems(),
            error: (err: any) => console.error('Failed to remove item', err)
        });
    }

    getTotalPrice(): number {
        return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getTotalQuantity(): number {
        return this.cartItems.reduce((total, item) => total + item.quantity, 0);
    }

    checkout(): void {
        console.log('Proceeding to checkout');
    }
}
