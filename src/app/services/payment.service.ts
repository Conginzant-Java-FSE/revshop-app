import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

export interface RazorpayOrderResponse {
    razorpayOrderId: string;
    amount: number;
    currency: string;
    keyId: string;
}

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private apiUrl = '/api/payments';

    constructor(private http: HttpClient) { }

    createRazorpayOrder(amount: number, orderId: number): Observable<ApiResponse<RazorpayOrderResponse>> {
        // amount is in rupees — backend expects paise (rupees * 100)
        return this.http.post<ApiResponse<RazorpayOrderResponse>>(`${this.apiUrl}/create-order`, {
            amount: Math.round(amount * 100),
            currency: 'INR',
            orderId
        });
    }

    verifyPayment(payload: {
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
        internalOrderId: number;
    }): Observable<ApiResponse<boolean>> {
        return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/verify`, payload);
    }
}
