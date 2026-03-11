import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProductDetailComponent } from './product-detail';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { ProductService, ProductDTO, ProductVideo } from '../../services/product';
import { CartService } from '../../services/cart';
import { ReviewService } from '../../services/review';
import { FavoriteService } from '../../services/favorite';
import { ToastService } from '../../services/toast';
import { of } from 'rxjs';
import { Review } from '../../models/review.model';
import { Favorite } from '../../models/favorite.model';

// ─── Test data ───────────────────────────────────────────────────────────────

const MOCK_PRODUCT: ProductDTO = {
    productId: 10,
    name: 'Wireless Headphones',
    description: 'High-quality wireless headphones',
    mrp: 3000,
    sellingPrice: 2400,
    stockQuantity: 5,
    thresholdQuantity: 1,
    imageUrl: 'headphones.jpg',
    isActive: true,
    categoryId: 2,
    sellerId: 3,
    categoryName: 'Audio',
    sellerName: 'TechSeller',
    additionalImages: ['img1.jpg', 'img2.jpg']
};

const MOCK_REVIEWS: Review[] = [
    { reviewId: 1, productId: 10, userId: 42, userName: 'Alice', rating: 5, reviewText: 'Excellent!', createdAt: '2024-01-01' }
];

const MOCK_FAVORITES: Favorite[] = [{ productId: 10, productName: 'Wireless Headphones' }];

const MOCK_SIMILAR_PRODUCTS: ProductDTO[] = [
    { productId: 11, name: 'Wired Headphones', sellingPrice: 1500, categoryId: 2 }
];

const MOCK_VIDEOS: ProductVideo[] = [
    { productId: 10, videoUrl: 'https://youtube.com/watch?v=123', videoType: 'YOUTUBE' }
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ProductDetailComponent', () => {
    let component: ProductDetailComponent;
    let fixture: ComponentFixture<ProductDetailComponent>;
    let productService: jasmine.SpyObj<ProductService>;
    let cartService: jasmine.SpyObj<CartService>;
    let reviewService: jasmine.SpyObj<ReviewService>;
    let favoriteService: jasmine.SpyObj<FavoriteService>;
    let toastService: jasmine.SpyObj<ToastService>;

    beforeEach(async () => {
        productService = jasmine.createSpyObj('ProductService', ['getProductById', 'getSimilarProducts', 'compareProducts', 'getProductVideos']);
        productService.getProductById.and.returnValue(of({ message: 'ok', data: MOCK_PRODUCT }));
        productService.getSimilarProducts.and.returnValue(of({ message: 'ok', data: MOCK_SIMILAR_PRODUCTS }));
        productService.compareProducts.and.returnValue(of({ message: 'ok', data: [MOCK_PRODUCT, MOCK_SIMILAR_PRODUCTS[0]] }));
        productService.getProductVideos.and.returnValue(of({ message: 'ok', data: MOCK_VIDEOS }));

        cartService = jasmine.createSpyObj('CartService', ['addItemToCart']);
        cartService.addItemToCart.and.returnValue(of({ message: 'ok', data: {} }));

        reviewService = jasmine.createSpyObj('ReviewService', [
            'getReviewsByProduct',
            'getAverageRating',
            'checkReviewEligibility',
            'addReview'
        ]);
        reviewService.getReviewsByProduct.and.returnValue(of({ message: 'ok', data: MOCK_REVIEWS }));
        reviewService.getAverageRating.and.returnValue(of({ message: 'ok', data: { averageRating: 4.5, reviewCount: 1 } }));
        reviewService.checkReviewEligibility.and.returnValue(of({ message: 'ok', data: { hasPurchased: true, hasReviewed: false, canReview: true } }));
        reviewService.addReview.and.returnValue(of({ message: 'ok', data: MOCK_REVIEWS[0] }));

        favoriteService = jasmine.createSpyObj('FavoriteService', ['getFavorites', 'addToFavorite', 'removeFromFavorite']);
        favoriteService.getFavorites.and.returnValue(of({ message: 'ok', data: MOCK_FAVORITES }));
        favoriteService.addToFavorite.and.returnValue(of({ message: 'ok', data: undefined }));
        favoriteService.removeFromFavorite.and.returnValue(of({ message: 'ok', data: undefined }));

        toastService = jasmine.createSpyObj('ToastService', ['success', 'error']);

        await TestBed.configureTestingModule({
            imports: [ProductDetailComponent],
            providers: [
                provideRouter([]),
                {
                    provide: ActivatedRoute,
                    useValue: { snapshot: { paramMap: { get: () => '10' } } }
                },
                { provide: ProductService, useValue: productService },
                { provide: CartService, useValue: cartService },
                { provide: ReviewService, useValue: reviewService },
                { provide: FavoriteService, useValue: favoriteService },
                { provide: ToastService, useValue: toastService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ProductDetailComponent);
        component = fixture.componentInstance;
        spyOn(localStorage, 'getItem').and.callFake((key: string) => {
            if (key === 'userId') return '42';
            return null;
        });
        fixture.detectChanges();
        await fixture.whenStable();
    });

    // ── Creation ──────────────────────────────────────────────────────────────

    it('should create the product detail component', () => {
        expect(component).toBeTruthy();
    });

    // ── Initial signal values ─────────────────────────────────────────────────

    it('should have initial quantity set to 1', () => {
        expect(component.quantity()).toBe(1);
    });

    it('should have stars array with 5 elements', () => {
        expect(component.stars.length).toBe(5);
        expect(component.stars).toEqual([1, 2, 3, 4, 5]);
    });

    it('should have default review rating of 5', () => {
        expect(component.newReview.rating).toBe(5);
    });

    // ── Data loading ──────────────────────────────────────────────────────────

    it('should load product data on init', () => {
        expect(productService.getProductById).toHaveBeenCalledWith(10);
        expect(component.product()).toEqual(MOCK_PRODUCT);
    });

    it('should set loading to false after product loads', () => {
        expect(component.loading()).toBeFalse();
    });

    it('should load reviews on init', () => {
        expect(reviewService.getReviewsByProduct).toHaveBeenCalledWith(10);
        expect(component.reviews()).toEqual(MOCK_REVIEWS);
    });

    it('should load average rating on init', () => {
        expect(component.averageRating()).toBe(4.5);
        expect(component.reviewCount()).toBe(1);
    });

    it('should check if product is a favorite when userId exists', () => {
        expect(favoriteService.getFavorites).toHaveBeenCalledWith(42);
        expect(component.isFavorite()).toBeTrue();
    });

    // ── Product information binding ───────────────────────────────────────────

    it('should bind product name correctly', () => {
        expect(component.product()?.name).toBe('Wireless Headphones');
    });

    it('should bind product sellingPrice correctly', () => {
        expect(component.product()?.sellingPrice).toBe(2400);
    });

    it('should bind product description correctly', () => {
        expect(component.product()?.description).toBe('High-quality wireless headphones');
    });

    it('should bind product imageUrl correctly', () => {
        expect(component.product()?.imageUrl).toBe('headphones.jpg');
    });

    // ── Quantity controls ─────────────────────────────────────────────────────

    it('should increment quantity when incrementQty is called and stock allows', () => {
        component.incrementQty();
        expect(component.quantity()).toBe(2);
    });

    it('should NOT increment quantity beyond stockQuantity', () => {
        component.quantity.set(5); // equals MOCK_PRODUCT.stockQuantity
        component.incrementQty();
        expect(component.quantity()).toBe(5);
    });

    it('should decrement quantity when decrementQty is called and qty > 1', () => {
        component.quantity.set(3);
        component.decrementQty();
        expect(component.quantity()).toBe(2);
    });

    it('should NOT decrement quantity below 1', () => {
        component.quantity.set(1);
        component.decrementQty();
        expect(component.quantity()).toBe(1);
    });

    // ── Rating ────────────────────────────────────────────────────────────────

    it('should update newReview.rating when setRating is called', () => {
        component.setRating(3);
        expect(component.newReview.rating).toBe(3);
    });

    it('getStarArray should return array of 5 elements', () => {
        expect(component.getStarArray()).toEqual([1, 2, 3, 4, 5]);
    });

    // ── Add to cart ───────────────────────────────────────────────────────────

    it('should call cartService.addItemToCart with correct args when user is logged in', fakeAsync(() => {
        component.addToCart();
        tick();
        expect(cartService.addItemToCart).toHaveBeenCalledWith(42, 10, 1);
    }));

    it('should show error toast when addToCart is called without login', () => {
        (window.localStorage.getItem as unknown as jasmine.Spy).and.returnValue(null);
        component.addToCart();
        expect(toastService.error).toHaveBeenCalledWith('Please login to add items to cart');
    });

    // ── Toggle favourite ──────────────────────────────────────────────────────

    it('should call removeFromFavorite when isFavorite is true and toggleFavorite is called', fakeAsync(() => {
        component.isFavorite.set(true);
        component.toggleFavorite();
        tick();
        expect(favoriteService.removeFromFavorite).toHaveBeenCalledWith(42, 10);
        expect(component.isFavorite()).toBeFalse();
    }));

    it('should call addToFavorite when isFavorite is false and toggleFavorite is called', fakeAsync(() => {
        component.isFavorite.set(false);
        component.toggleFavorite();
        tick();
        expect(favoriteService.addToFavorite).toHaveBeenCalledWith(42, 10);
        expect(component.isFavorite()).toBeTrue();
    }));

    it('should show error toast when toggleFavorite is called without login', () => {
        (window.localStorage.getItem as unknown as jasmine.Spy).and.returnValue(null);
        component.toggleFavorite();
        expect(toastService.error).toHaveBeenCalledWith('Please login to favorite products');
    });

    // ── Submit review ─────────────────────────────────────────────────────────

    it('should show error toast for empty review text on submitReview', () => {
        component.newReview.reviewText = '   ';
        component.submitReview();
        expect(toastService.error).toHaveBeenCalledWith('Review text cannot be empty');
    });

    it('should call reviewService.addReview when submitReview is valid', fakeAsync(() => {
        component.newReview.reviewText = 'Great product!';
        component.newReview.rating = 4;
        component.submitReview();
        tick();
        expect(reviewService.addReview).toHaveBeenCalledWith({
            userId: 42,
            productId: 10,
            rating: 4,
            reviewText: 'Great product!'
        });
    }));

    it('should show error toast when submitReview is called without login', () => {
        (window.localStorage.getItem as unknown as jasmine.Spy).and.returnValue(null);
        component.newReview.reviewText = 'Good';
        component.submitReview();
        expect(toastService.error).toHaveBeenCalledWith('Please login to submit a review');
    });

    // ── New Features ─────────────────────────────────────────────────────────

    it('should load similar products on init', () => {
        expect(productService.getSimilarProducts).toHaveBeenCalledWith(10);
        expect(component.similarProducts()).toEqual(MOCK_SIMILAR_PRODUCTS);
    });

    it('should load comparison data for similar products', () => {
        expect(productService.compareProducts).toHaveBeenCalledWith([10, 11]);
        expect(component.comparisonProducts().length).toBe(2);
    });

    it('should load product videos on init', () => {
        expect(productService.getProductVideos).toHaveBeenCalledWith(10);
        expect(component.productVideos()).toEqual(MOCK_VIDEOS);
    });

    it('should change active tab when setActiveTab is called', () => {
        component.setActiveTab('specifications');
        expect(component.activeTab()).toBe('specifications');
    });

    it('should toggle zoom state', () => {
        component.toggleZoom(true);
        expect(component.isZoomed()).toBeTrue();
        component.toggleZoom(false);
        expect(component.isZoomed()).toBeFalse();
    });

    it('should update zoom position on mouse move', () => {
        const mockEvent = {
            target: { getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }) },
            clientX: 50,
            clientY: 50
        } as unknown as MouseEvent;

        component.onMouseMove(mockEvent);
        expect(component.zoomPosition()).toEqual({ x: 50, y: 50 });
    });

    it('should return safe YouTube URL', () => {
        const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        const safeUrl = component.getSafeUrl(url);
        expect(safeUrl).toBeTruthy();
    });

    // ── Image Gallery ─────────────────────────────────────────────────────────

    it('should populate allImages with main image and additional images', () => {
        expect(component.allImages()).toEqual(['headphones.jpg', 'img1.jpg', 'img2.jpg']);
    });

    it('should increment currentImageIndex when nextImage is called', () => {
        component.nextImage();
        expect(component.currentImageIndex()).toBe(1);
        component.nextImage();
        expect(component.currentImageIndex()).toBe(2);
        component.nextImage(); // should wrap around
        expect(component.currentImageIndex()).toBe(0);
    });

    it('should decrement currentImageIndex when prevImage is called', () => {
        component.currentImageIndex.set(0);
        component.prevImage(); // should wrap to the end
        expect(component.currentImageIndex()).toBe(2);
        component.prevImage();
        expect(component.currentImageIndex()).toBe(1);
    });

    it('should set currentImageIndex when setCurrentImage is called', () => {
        component.setCurrentImage(1);
        expect(component.currentImageIndex()).toBe(1);
    });
});
