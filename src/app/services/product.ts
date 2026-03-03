import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ProductDTO {
    productId?: number;
    name: string;
    description: string;
    mrp: number;
    sellingPrice: number;
    stockQuantity: number;
    thresholdQuantity: number;
    imageUrl?: string;
    isActive: boolean;
    categoryId: number;
    sellerId: number;
}

import { ApiResponse } from '../models/api-response.model';

export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = '/api/products';

    constructor(private http: HttpClient) { }

    getAllProducts(page: number = 0, size: number = 10, sortBy: string = 'productId', direction: string = 'asc'): Observable<ApiResponse<Page<ProductDTO>>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sortBy', sortBy)
            .set('direction', direction);

        return this.http.get<ApiResponse<Page<ProductDTO>>>(this.apiUrl, { params });
    }

    getProductById(id: number): Observable<ApiResponse<ProductDTO>> {
        return this.http.get<ApiResponse<ProductDTO>>(`${this.apiUrl}/${id}`);
    }

    searchProducts(keyword: string, page: number = 0, size: number = 10): Observable<ApiResponse<Page<ProductDTO>>> {
        let params = new HttpParams()
            .set('keyword', keyword)
            .set('page', page.toString())
            .set('size', size.toString());

        return this.http.get<ApiResponse<Page<ProductDTO>>>(`${this.apiUrl}/search`, { params });
    }

    filterProducts(filters: { minPrice?: number, maxPrice?: number, categoryId?: number }, page: number = 0, size: number = 10): Observable<ApiResponse<Page<ProductDTO>>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (filters.minPrice !== undefined) params = params.set('minPrice', filters.minPrice.toString());
        if (filters.maxPrice !== undefined) params = params.set('maxPrice', filters.maxPrice.toString());
        if (filters.categoryId !== undefined) params = params.set('categoryId', filters.categoryId.toString());

        return this.http.get<ApiResponse<Page<ProductDTO>>>(`${this.apiUrl}/filter`, { params });
    }

    createProduct(product: ProductDTO): Observable<ApiResponse<ProductDTO>> {
        return this.http.post<ApiResponse<ProductDTO>>(this.apiUrl, product);
    }

    updateProduct(id: number, product: ProductDTO): Observable<ApiResponse<ProductDTO>> {
        return this.http.put<ApiResponse<ProductDTO>>(`${this.apiUrl}/${id}`, product);
    }

    deleteProduct(id: number): Observable<ApiResponse<string>> {
        return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${id}`);
    }
}
