import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

export interface CategoryDTO {
    categoryId: number;
    name: string;
    description: string;
    parentCategoryId?: number;
}

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private apiUrl = '/api/categories';

    constructor(private http: HttpClient) { }

    getAllCategories(): Observable<ApiResponse<CategoryDTO[]>> {
        return this.http.get<ApiResponse<CategoryDTO[]>>(this.apiUrl);
    }

    getCategoryById(id: number): Observable<ApiResponse<CategoryDTO>> {
        return this.http.get<ApiResponse<CategoryDTO>>(`${this.apiUrl}/${id}`);
    }
}
