import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderRequest, OrderResponse } from '../models/order.model';
import { ApiResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
    private baseUrl = '/api/orders';

    constructor(private http: HttpClient) { }

    placeOrder(order: OrderRequest): Observable<ApiResponse<OrderResponse>> {
        return this.http.post<ApiResponse<OrderResponse>>(`${this.baseUrl}/place`, order);
    }

    getUserOrders(userId: number): Observable<ApiResponse<OrderResponse[]>> {
        return this.http.get<ApiResponse<OrderResponse[]>>(`${this.baseUrl}/user/${userId}`);
    }

    cancelOrder(orderId: number, userId: number): Observable<ApiResponse<any>> {
        return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${orderId}/cancel`, { userId });
    }

    getSellerOrders(sellerId: number): Observable<ApiResponse<OrderResponse[]>> {
        return this.http.get<ApiResponse<OrderResponse[]>>(`${this.baseUrl}/seller/${sellerId}`);
    }

    updateOrderStatus(orderId: number, status: string, sellerId: number): Observable<ApiResponse<OrderResponse>> {
        return this.http.put<ApiResponse<OrderResponse>>(`${this.baseUrl}/${orderId}/status`, { status, sellerId: String(sellerId) });
    }
}

