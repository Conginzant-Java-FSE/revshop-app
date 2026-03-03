import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Favorite } from '../models/favorite.model';

@Injectable({
    providedIn: 'root'
})
export class FavoriteService {
    private apiUrl = '/api/favorites';

    constructor(private http: HttpClient) { }

    getFavorites(userId: number): Observable<ApiResponse<Favorite[]>> {
        return this.http.get<ApiResponse<Favorite[]>>(`${this.apiUrl}/${userId}`);
    }

    addToFavorite(userId: number, productId: number): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${userId}/${productId}`, {});
    }

    removeFromFavorite(userId: number, productId: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${userId}/${productId}`);
    }
}
