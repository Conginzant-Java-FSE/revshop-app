import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Category } from '../models/category.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
    private readonly baseUrl = 'http://localhost:8080/api/categories';

    constructor(private http: HttpClient) { }

    getAllCategories(): Observable<Category[]> {
        return this.http
            .get<ApiResponse<Category[]>>(this.baseUrl)
            .pipe(map((res) => res.data));
    }

    getCategoryById(id: number): Observable<Category> {
        return this.http
            .get<ApiResponse<Category>>(`${this.baseUrl}/${id}`)
            .pipe(map((res) => res.data));
    }
}
