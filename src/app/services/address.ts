import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

export interface AddressDTO {
    addressId?: number;
    addressLine: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
    userId?: number;
}

@Injectable({
    providedIn: 'root'
})
export class AddressService {
    private apiUrl = '/api/addresses';

    constructor(private http: HttpClient) { }

    getAddressesByUserId(userId: number): Observable<ApiResponse<AddressDTO[]>> {
        return this.http.get<ApiResponse<AddressDTO[]>>(`${this.apiUrl}/user/${userId}`);
    }

    addAddress(address: AddressDTO, userId: number): Observable<ApiResponse<AddressDTO>> {
        return this.http.post<ApiResponse<AddressDTO>>(this.apiUrl, address, {
            params: { userId: userId.toString() }
        });
    }

    updateAddress(id: number, address: AddressDTO): Observable<ApiResponse<AddressDTO>> {
        return this.http.put<ApiResponse<AddressDTO>>(`${this.apiUrl}/${id}`, address);
    }

    deleteAddress(id: number): Observable<ApiResponse<string>> {
        return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${id}`);
    }
}
