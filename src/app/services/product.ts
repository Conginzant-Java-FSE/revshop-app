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
    additionalImages?: string[];
    isActive: boolean;
    categoryId: number;
    sellerId: number;
    categoryName?: string;
    sellerName?: string;
    attributes?: Record<string, string>;
}

export interface ProductVideo {
    videoId?: number;
    productId: number;
    videoUrl: string;
    videoType: 'YOUTUBE' | 'UPLOADED';
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

    searchProducts(keyword: string, page: number = 0, size: number = 10, sortBy: string = 'productId', direction: string = 'asc'): Observable<ApiResponse<Page<ProductDTO>>> {
        let params = new HttpParams()
            .set('keyword', keyword)
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sortBy', sortBy)
            .set('direction', direction);

        return this.http.get<ApiResponse<Page<ProductDTO>>>(`${this.apiUrl}/search`, { params });
    }

    filterProducts(filters: { minPrice?: number, maxPrice?: number, categoryId?: number, minRating?: number, minDiscount?: number, keyword?: string, dynamicFilters?: Record<string, string> }, page: number = 0, size: number = 10, sortBy: string = 'productId', direction: string = 'asc'): Observable<ApiResponse<Page<ProductDTO>>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sortBy', sortBy)
            .set('direction', direction);

        if (filters.keyword !== undefined) params = params.set('keyword', filters.keyword);
        if (filters.minPrice !== undefined) params = params.set('minPrice', filters.minPrice.toString());
        if (filters.maxPrice !== undefined) params = params.set('maxPrice', filters.maxPrice.toString());
        if (filters.categoryId !== undefined) params = params.set('categoryId', filters.categoryId.toString());
        if (filters.minRating !== undefined) params = params.set('minRating', filters.minRating.toString());
        if (filters.minDiscount !== undefined) params = params.set('minDiscount', filters.minDiscount.toString());

        if (filters.dynamicFilters) {
            Object.keys(filters.dynamicFilters).forEach(key => {
                if (filters.dynamicFilters![key]) {
                    params = params.set(key, filters.dynamicFilters![key]);
                }
            });
        }

        return this.http.get<ApiResponse<Page<ProductDTO>>>(`${this.apiUrl}/filter`, { params });
    }

    createProduct(product: ProductDTO): Observable<ApiResponse<ProductDTO>> {
        return this.http.post<ApiResponse<ProductDTO>>(this.apiUrl, product);
    }

    uploadImage(file: File): Observable<ApiResponse<{ url: string }>> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<ApiResponse<{ url: string }>>('/api/upload', formData);
    }

    updateProduct(id: number, product: ProductDTO): Observable<ApiResponse<ProductDTO>> {
        return this.http.put<ApiResponse<ProductDTO>>(`${this.apiUrl}/${id}`, product);
    }

    deleteProduct(id: number): Observable<ApiResponse<string>> {
        return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${id}`);
    }

    getProductsBySeller(sellerId: number, page: number = 0, size: number = 20): Observable<ApiResponse<Page<ProductDTO>>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        return this.http.get<ApiResponse<Page<ProductDTO>>>(`${this.apiUrl}/seller/${sellerId}`, { params });
    }

    toggleActive(productId: number): Observable<ApiResponse<ProductDTO>> {
        return this.http.patch<ApiResponse<ProductDTO>>(`${this.apiUrl}/${productId}/toggle-active`, {});
    }

    getSimilarProducts(productId: number): Observable<ApiResponse<ProductDTO[]>> {
        return this.http.get<ApiResponse<ProductDTO[]>>(`${this.apiUrl}/${productId}/similar`);
    }

    compareProducts(ids: number[]): Observable<ApiResponse<ProductDTO[]>> {
        let params = new HttpParams();
        ids.forEach(id => {
            params = params.append('ids', id.toString());
        });
        return this.http.get<ApiResponse<ProductDTO[]>>(`${this.apiUrl}/compare`, { params });
    }

    getProductVideos(productId: number): Observable<ApiResponse<ProductVideo[]>> {
        return this.http.get<ApiResponse<ProductVideo[]>>(`${this.apiUrl}/${productId}/videos`);
    }

    addProductVideo(productId: number, videoUrl: string, videoType: string): Observable<ApiResponse<ProductVideo>> {
        return this.http.post<ApiResponse<ProductVideo>>(`${this.apiUrl}/${productId}/videos`, { videoUrl, videoType });
    }
}
