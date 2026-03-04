import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

export interface CouponValidationResult {
    valid: boolean;
    discountAmount: number;
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class CouponService {
    private apiUrl = '/api/coupons';

    constructor(private http: HttpClient) { }

    validateCoupon(code: string, orderAmount: number): Observable<ApiResponse<CouponValidationResult>> {
        return this.http.post<ApiResponse<CouponValidationResult>>(`${this.apiUrl}/validate`, {
            code,
            orderAmount
        });
    }
}
