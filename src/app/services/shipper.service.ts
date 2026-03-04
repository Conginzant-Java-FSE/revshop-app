import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

export interface ShipperDTO {
    shipperId: number;
    name: string;
    phone: string;
    email: string;
    vehicleNumber: string;
    isAvailable: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ShipperService {
    private apiUrl = '/api/shippers';

    constructor(private http: HttpClient) { }

    getAllShippers(): Observable<ApiResponse<ShipperDTO[]>> {
        return this.http.get<ApiResponse<ShipperDTO[]>>(this.apiUrl);
    }

    getAvailableShippers(): Observable<ApiResponse<ShipperDTO[]>> {
        return this.http.get<ApiResponse<ShipperDTO[]>>(`${this.apiUrl}/available`);
    }

    assignShipper(shipperId: number, orderId: number): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${shipperId}/assign/${orderId}`, {});
    }

    createShipper(shipper: Partial<ShipperDTO>): Observable<ApiResponse<ShipperDTO>> {
        return this.http.post<ApiResponse<ShipperDTO>>(this.apiUrl, shipper);
    }
}
