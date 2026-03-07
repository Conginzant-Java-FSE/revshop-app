import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { ProductService, ProductDTO } from '../../services/product';
import { CartService } from '../../services/cart';
import { ReviewService } from '../../services/review';
import { FavoriteService } from '../../services/favorite';
import { Review } from '../../models/review.model';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast';
import { Location } from '@angular/common';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './product-detail.html',
    styleUrl: './product-detail.css'
})
export class ProductDetailComponent implements OnInit {
    product = signal<ProductDTO | null>(null);
    reviews = signal<Review[]>([]);
    isFavorite = signal<boolean>(false);
    quantity = signal<number>(1);
    loading = signal<boolean>(true);
    allImages = signal<string[]>([]);
    currentImageIndex = signal<number>(0);
    averageRating = signal<number>(0);
    reviewCount = signal<number>(0);
    hasPurchased = signal<boolean>(false);
    hasUserReviewed = signal<boolean>(false);
    canReview = signal<boolean>(false);
    stars = [1, 2, 3, 4, 5];

    newReview = {
        rating: 5,
        reviewText: ''
    };

    constructor(
        private route: ActivatedRoute,
        private productService: ProductService,
        private cartService: CartService,
        private reviewService: ReviewService,
        private favoriteService: FavoriteService,
        private toastService: ToastService,
        private location: Location,
        private router: Router
    ) { }

    goBack(): void {
        this.location.back();
    }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            const productId = Number(id);
            const userId = localStorage.getItem('userId');
            this.loadProduct(productId);
            this.loadReviews(productId);
            this.loadAverageRating(productId);
            if (userId) {
                this.checkIfFavorite(productId);
                this.checkReviewEligibility(productId, Number(userId));
            }
        }
    }

    loadProduct(id: number): void {
        this.productService.getProductById(id).subscribe({
            next: (res) => {
                const p = res.data;
                this.product.set(p);

                const images = [];
                if (p.imageUrl) images.push(p.imageUrl);
                if (p.additionalImages && p.additionalImages.length > 0) {
                    images.push(...p.additionalImages);
                }
                this.allImages.set(images);

                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    loadReviews(productId: number): void {
        this.reviewService.getReviewsByProduct(productId).subscribe({
            next: (res) => this.reviews.set(res.data ?? []),
            error: () => this.reviews.set([])
        });
    }

    loadAverageRating(productId: number): void {
        this.reviewService.getAverageRating(productId).subscribe({
            next: (res) => {
                this.averageRating.set(res.data.averageRating);
                this.reviewCount.set(res.data.reviewCount);
            },
            error: () => { /* ignore */ }
        });
    }

    checkReviewEligibility(productId: number, userId: number): void {
        this.reviewService.checkReviewEligibility(userId, productId).subscribe({
            next: (res) => {
                this.hasPurchased.set(res.data.hasPurchased);
                this.hasUserReviewed.set(res.data.hasReviewed);
                this.canReview.set(res.data.canReview);
            },
            error: () => { /* ignore */ }
        });
    }

    setRating(star: number): void {
        this.newReview.rating = star;
    }

    checkIfFavorite(productId: number): void {
        const userId = localStorage.getItem('userId');
        if (userId) {
            this.favoriteService.getFavorites(Number(userId)).subscribe({
                next: (res) => {
                    const exists = res.data.some(f => f.productId === productId);
                    this.isFavorite.set(exists);
                }
            });
        }
    }

    toggleFavorite(): void {
        const userId = localStorage.getItem('userId');
        const prod = this.product();
        if (!userId) {
            this.toastService.error('Please login to favorite products');
            return;
        }
        if (prod && prod.productId) {
            if (this.isFavorite()) {
                this.favoriteService.removeFromFavorite(Number(userId), prod.productId).subscribe({
                    next: () => {
                        this.isFavorite.set(false);
                        this.toastService.success('Removed from favorites');
                    }
                });
            } else {
                this.favoriteService.addToFavorite(Number(userId), prod.productId).subscribe({
                    next: () => {
                        this.isFavorite.set(true);
                        this.toastService.success('Added to favorites');
                    }
                });
            }
        }
    }

    submitReview(): void {
        const userId = localStorage.getItem('userId');
        const prod = this.product();
        if (!userId) {
            this.toastService.error('Please login to submit a review');
            return;
        }
        if (!this.newReview.reviewText.trim()) {
            this.toastService.error('Review text cannot be empty');
            return;
        }
        if (prod && prod.productId) {
            const reviewData: any = {
                userId: Number(userId),
                productId: prod.productId,
                rating: Number(this.newReview.rating),
                reviewText: this.newReview.reviewText
            };
            this.reviewService.addReview(reviewData).subscribe({
                next: () => {
                    this.toastService.success('Review submitted successfully!');
                    this.newReview.reviewText = '';
                    this.newReview.rating = 5;
                    this.hasUserReviewed.set(true);
                    this.canReview.set(false);
                    if (prod && prod.productId) {
                        this.loadReviews(prod.productId);
                        this.loadAverageRating(prod.productId);
                    }
                }
            });
        }
    }

    addToCart(): void {
        const userId = localStorage.getItem('userId');
        const prod = this.product();
        if (!userId) {
            this.toastService.error('Please login to add items to cart');
            return;
        }
        if (prod && prod.productId) {
            this.cartService.addItemToCart(Number(userId), prod.productId, this.quantity()).subscribe({
                next: () => this.toastService.success('Product added to cart!'),
                error: (err) => console.error(err)
            });
        }
    }

    incrementQty(): void {
        const prod = this.product();
        if (prod && this.quantity() < prod.stockQuantity) {
            this.quantity.set(this.quantity() + 1);
        }
    }

    decrementQty(): void {
        if (this.quantity() > 1) {
            this.quantity.set(this.quantity() - 1);
        }
    }

    buyNow(): void {
        const userId = localStorage.getItem('userId');
        const prod = this.product();
        if (!userId) {
            this.toastService.error('Please login to buy items');
            return;
        }
        if (prod && prod.productId) {
            this.cartService.addItemToCart(Number(userId), prod.productId, this.quantity()).subscribe({
                next: () => {
                    this.router.navigate(['/checkout'], {
                        queryParams: { buyNow: 'true', productId: prod.productId }
                    });
                },
                error: (err) => console.error(err)
            });
        }
    }

    getStarArray(): number[] {
        return [1, 2, 3, 4, 5];
    }

    nextImage(): void {
        const length = this.allImages().length;
        if (length > 0) {
            this.currentImageIndex.set((this.currentImageIndex() + 1) % length);
        }
    }

    prevImage(): void {
        const length = this.allImages().length;
        if (length > 0) {
            this.currentImageIndex.set((this.currentImageIndex() - 1 + length) % length);
        }
    }

    setCurrentImage(index: number): void {
        this.currentImageIndex.set(index);
    }
}
