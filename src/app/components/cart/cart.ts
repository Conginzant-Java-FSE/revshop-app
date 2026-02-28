import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart.model';
import { Navbar } from '../shared/navbar/navbar';
import { Footer } from '../shared/footer/footer';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, RouterModule, Navbar, Footer],
    templateUrl: './cart.html',
    styleUrl: './cart.css'
})
export class CartComponent implements OnInit, OnDestroy {
    cartItems: CartItem[] = [];
    grandTotal: number = 0;
    private subscription!: Subscription;

    constructor(private cartService: CartService, private router: Router) { }

    ngOnInit(): void {
        this.subscription = this.cartService.cart$.subscribe(items => {
            this.cartItems = items;
            this.grandTotal = this.cartService.getGrandTotal();
        });
    }

    increaseQuantity(item: CartItem): void {
        this.cartService.updateQuantity(item.productId, item.quantity + 1);
    }

    decreaseQuantity(item: CartItem): void {
        this.cartService.updateQuantity(item.productId, item.quantity - 1);
    }

    removeItem(productId: number): void {
        this.cartService.removeFromCart(productId);
    }

    clearCart(): void {
        this.cartService.clearCart();
    }

    proceedToCheckout(): void {
        this.router.navigate(['/checkout']);
    }

    continueShopping(): void {
        this.router.navigate(['/']);
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
