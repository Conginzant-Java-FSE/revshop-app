import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
    private readonly baseUrl = 'http://localhost:8080/api/products';

    constructor(private http: HttpClient) { }

    getAllProducts(): Observable<Product[]> {
        return this.http
            .get<ApiResponse<Product[]>>(this.baseUrl)
            .pipe(map((res) => res.data));
    }

    getProductById(id: number): Observable<Product> {
        return this.http
            .get<ApiResponse<Product>>(`${this.baseUrl}/${id}`)
            .pipe(map((res) => res.data));
    }

    searchProducts(keyword: string): Observable<Product[]> {
        const params = new HttpParams().set('keyword', keyword);
        return this.http
            .get<ApiResponse<Product[]>>(`${this.baseUrl}/search`, { params })
            .pipe(map((res) => res.data));
    }

    getProductsByCategory(categoryId: number): Observable<Product[]> {
        return this.getAllProducts().pipe(
            map((products) => products.filter((p) => p.categoryId === categoryId))
        );
    }
}
