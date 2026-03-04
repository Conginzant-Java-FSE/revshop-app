import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Review, ReviewDTO } from '../models/review.model';

@Injectable({
    providedIn: 'root'
})
export class ReviewService {
    private apiUrl = '/api/reviews';

    constructor(private http: HttpClient) { }

    getReviewsByProduct(productId: number): Observable<ApiResponse<Review[]>> {
        return this.http.get<ApiResponse<Review[]>>(`${this.apiUrl}/product/${productId}`);
    }

    addReview(review: ReviewDTO): Observable<ApiResponse<Review>> {
        return this.http.post<ApiResponse<Review>>(this.apiUrl, review);
    }

    deleteReview(reviewId: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${reviewId}`);
    }

    getAverageRating(productId: number): Observable<ApiResponse<{ averageRating: number; reviewCount: number }>> {
        return this.http.get<ApiResponse<{ averageRating: number; reviewCount: number }>>(
            `${this.apiUrl}/product/${productId}/average-rating`
        );
    }

    hasUserReviewed(userId: number, productId: number): Observable<ApiResponse<boolean>> {
        const params = new HttpParams()
            .set('userId', userId.toString())
            .set('productId', productId.toString());
        return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/check`, { params });
    }
}
