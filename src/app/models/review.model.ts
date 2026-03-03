export interface Review {
    reviewId: number;
    productId: number;
    userId: number;
    userName: string;
    rating: number;
    reviewText: string;
    createdAt: string;
}

export interface ReviewDTO {
    userId: number;
    productId: number;
    rating: number;
    reviewText: string;
}
