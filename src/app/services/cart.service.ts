import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from '../models/cart.model';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private apiUrl = 'http://localhost:8080/api/orders';

    private cartItems: CartItem[] = [];
    private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
    private cartCountSubject = new BehaviorSubject<number>(0);

    cart$ = this.cartItemsSubject.asObservable();
    cartCount$ = this.cartCountSubject.asObservable();

    constructor(private http: HttpClient) { }

    // ==== Cart State Management ====

    /**
     * Add a product to the cart. If it already exists, increment the quantity.
     */
    addToCart(product: { productId: number; productName: string; imageUrl: string; price: number }): void {
        const existingItem = this.cartItems.find(item => item.productId === product.productId);

        if (existingItem) {
            existingItem.quantity += 1;
            existingItem.subtotal = existingItem.price * existingItem.quantity;
        } else {
            const newItem: CartItem = {
                productId: product.productId,
                productName: product.productName,
                imageUrl: product.imageUrl,
                price: product.price,
                quantity: 1,
                subtotal: product.price
            };
            this.cartItems.push(newItem);
        }

        this.updateCart();
    }

    /**
     * Remove an item from the cart entirely by productId.
     */
    removeFromCart(productId: number): void {
        this.cartItems = this.cartItems.filter(item => item.productId !== productId);
        this.updateCart();
    }

    /**
     * Update the quantity of a specific cart item.
     * If quantity drops to 0 or below, the item is removed.
     */
    updateQuantity(productId: number, quantity: number): void {
        if (quantity <= 0) {
            this.removeFromCart(productId);
            return;
        }

        const item = this.cartItems.find(i => i.productId === productId);
        if (item) {
            item.quantity = quantity;
            item.subtotal = item.price * quantity;
            this.updateCart();
        }
    }

    /**
     * Returns the current list of cart items.
     */
    getCartItems(): CartItem[] {
        return this.cartItems;
    }

    /**
     * Returns the grand total of all items in the cart.
     */
    getGrandTotal(): number {
        return this.cartItems.reduce((total, item) => total + item.subtotal, 0);
    }

    /**
     * Returns the total number of items in the cart.
     */
    getTotalItems(): number {
        return this.cartItems.reduce((count, item) => count + item.quantity, 0);
    }

    /**
     * Clears the entire cart.
     */
    clearCart(): void {
        this.cartItems = [];
        this.updateCart();
    }

    // ==== Backend Integration ====

    /**
     * Place an order by sending cart data to the backend.
     */
    placeOrder(orderPayload: any): Observable<any> {
        return this.http.post(this.apiUrl, orderPayload);
    }

    // ==== Private Helpers ====

    /**
     * Emits the updated cart items and count to all subscribers.
     */
    private updateCart(): void {
        this.cartItemsSubject.next([...this.cartItems]);
        this.cartCountSubject.next(this.getTotalItems());
    }
}
