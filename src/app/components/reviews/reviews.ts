import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService } from '../../services/review.service';
import { Review } from '../../models/review.model';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-reviews',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './reviews.html',
    styleUrl: './reviews.css'
})
export class ReviewsComponent implements OnInit {
    reviews: Review[] = [];
    productId: number = 0;
    errorMessage: string = '';
    loading: boolean = false;
    successMessage: string = '';

    newReview: Partial<Review> = {
        userName: '',
        rating: 5,
        comment: ''
    };

    constructor(
        private reviewService: ReviewService,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe((params: any) => {
            const idParam = params.get('productId');
            if (idParam) {
                this.productId = +idParam;
                this.loadReviews();
                this.newReview.productId = this.productId;
            }
        });
    }

    loadReviews(): void {
        if (this.productId) {
            this.loading = true;
            this.errorMessage = '';
            this.reviewService.getReviewsByProductId(this.productId).subscribe({
                next: (reviews: Review[]) => {
                    this.reviews = reviews;
                    this.loading = false;
                },
                error: (err: any) => {
                    console.error('Failed to load reviews', err);
                    this.errorMessage = 'Unable to load reviews. Please try again later.';
                    this.loading = false;
                }
            });
        }
    }

    addReview(): void {
        if (this.newReview.userName && this.newReview.comment) {
            const reviewToSubmit: Review = {
                ...this.newReview,
                id: 0,
                reviewDate: new Date().toISOString().split('T')[0]
            } as Review;

            this.reviewService.addReview(reviewToSubmit).subscribe({
                next: (addedReview: Review) => {
                    this.reviews.push(addedReview);
                    this.resetForm();
                    this.successMessage = 'Review submitted successfully!';
                    setTimeout(() => this.successMessage = '', 3000);
                },
                error: (err: any) => {
                    console.error('Failed to add review', err);
                    this.successMessage = 'Failed to submit review.';
                    setTimeout(() => this.successMessage = '', 3000);
                }
            });
        }
    }

    deleteReview(id: number): void {
        this.reviewService.deleteReview(id).subscribe({
            next: () => {
                this.reviews = this.reviews.filter(r => r.id !== id);
            },
            error: (err: any) => console.error('Failed to delete review', err)
        });
    }

    resetForm(): void {
        this.newReview = {
            productId: this.productId,
            userName: '',
            rating: 5,
            comment: ''
        };
    }
}
