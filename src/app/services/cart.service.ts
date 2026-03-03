import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartItem } from '../models/cart-item.model';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private apiUrl = 'http://localhost:8080/api/cart';

    constructor(private http: HttpClient) { }

    getCartItems(): Observable<CartItem[]> {
        return this.http.get<CartItem[]>(this.apiUrl);
    }

    addToCart(productId: number, quantity: number): Observable<CartItem> {
        return this.http.post<CartItem>(`${this.apiUrl}/add`, { productId, quantity });
    }

    updateQuantity(id: number, quantity: number): Observable<CartItem> {
        return this.http.put<CartItem>(`${this.apiUrl}/${id}`, { quantity });
    }

    removeItem(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    clearCart(): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/clear`);
    }
}
