import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

export interface CartItemDTO {
    cartItemId?: number;
    productId: number;
    productName?: string;
    price?: number;
    sellingPrice?: number;
    quantity: number;
    subtotal?: number;
    imageUrl?: string;
}

export interface CartDTO {
    cartId: number;
    items: CartItemDTO[];
    totalPrice: number;
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

    addItemToCart(userId: number, productId: number, quantity: number): Observable<ApiResponse<any>> {
        const body = { productId, quantity };
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/user/${userId}/add`, body);
    }

    updateItemQuantity(cartItemId: number, quantity: number): Observable<ApiResponse<any>> {
        return this.http.put<ApiResponse<any>>(`/api/cart-items/${cartItemId}`, { quantity });
    }

    removeItemFromCart(cartItemId: number): Observable<ApiResponse<any>> {
        return this.http.delete<ApiResponse<any>>(`/api/cart-items/${cartItemId}`);
    }

    clearCart(userId: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/user/${userId}/clear`);
    }
}
