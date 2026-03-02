import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../models/review.model';

@Injectable({
    providedIn: 'root'
})
export class ReviewService {
    private apiUrl = 'http://localhost:8080/api/reviews';

    constructor(private http: HttpClient) { }

    getReviewsByProductId(productId: number): Observable<Review[]> {
        return this.http.get<Review[]>(`${this.apiUrl}/product/${productId}`);
    }

    addReview(review: Review): Observable<Review> {
        return this.http.post<Review>(this.apiUrl, review);
    }

    deleteReview(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
