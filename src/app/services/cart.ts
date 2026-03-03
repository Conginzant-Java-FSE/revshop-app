import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

export interface CartItemDTO {
    cartItemId?: number;
    productId: number;
    productName: string;
    productPrice: number;
    quantity: number;
    subtotal: number;
}

export interface CartDTO {
    cartId: number;
    userId: number;
    cartItems: CartItemDTO[];
    totalAmount: number;
}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private apiUrl = '/api/carts';

    constructor(private http: HttpClient) { }

    getCartByUserId(userId: number): Observable<ApiResponse<CartDTO>> {
        return this.http.get<ApiResponse<CartDTO>>(`${this.apiUrl}/user/${userId}`);
    }

    addItemToCart(userId: number, productId: number, quantity: number): Observable<ApiResponse<CartItemDTO>> {
        return this.http.post<ApiResponse<CartItemDTO>>(`${this.apiUrl}/${userId}/items`, null, {
            params: { productId: productId.toString(), quantity: quantity.toString() }
        });
    }

    updateItemQuantity(cartItemId: number, quantity: number): Observable<ApiResponse<CartItemDTO>> {
        return this.http.put<ApiResponse<CartItemDTO>>(`${this.apiUrl}/items/${cartItemId}`, null, {
            params: { quantity: quantity.toString() }
        });
    }

    removeItemFromCart(userId: number, productId: number): Observable<ApiResponse<string>> {
        return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${userId}/items/${productId}`);
    }

    clearCart(userId: number): Observable<ApiResponse<string>> {
        return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${userId}/clear`);
    }
}
