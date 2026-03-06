import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

export interface CouponValidationResult {
    valid: boolean;
    discountAmount: number;
    message: string;
}

export interface Coupon {
    couponId: number;
    code: string;
    discountType: 'FIXED' | 'PERCENT';
    discountValue: number;
    minOrderAmount: number;
    expiryDate: string;
}

@Injectable({
    providedIn: 'root'
})
export class CouponService {
    private apiUrl = '/api/coupons';

    constructor(private http: HttpClient) { }

    getActiveCoupons(): Observable<ApiResponse<Coupon[]>> {
        return this.http.get<ApiResponse<Coupon[]>>(`${this.apiUrl}/active`);
    }

    validateCoupon(code: string, orderAmount: number): Observable<ApiResponse<CouponValidationResult>> {
        return this.http.post<ApiResponse<CouponValidationResult>>(`${this.apiUrl}/validate`, {
            code,
            orderAmount
        });
    }
}
