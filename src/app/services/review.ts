import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
}
