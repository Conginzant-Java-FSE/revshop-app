import { TestBed } from '@angular/core/testing';
import { ProductListComponent } from './product-list';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

describe('ProductListComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProductListComponent],
            providers: [provideRouter([]), provideHttpClient()],
        }).compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(ProductListComponent);
        const component = fixture.componentInstance;
        expect(component).toBeTruthy();
    });

    it('should calculate discount correctly', () => {
        const fixture = TestBed.createComponent(ProductListComponent);
        const component = fixture.componentInstance;
        const mockProduct = {
            productId: 1, name: 'Test', description: '', mrp: 1000, sellingPrice: 750,
            stockQuantity: 5, thresholdQuantity: 2, isActive: true, categoryId: 1, sellerId: 1,
        };
        expect(component.getDiscount(mockProduct)).toBe(25);
    });

    it('should identify sold out products', () => {
        const fixture = TestBed.createComponent(ProductListComponent);
        const component = fixture.componentInstance;
        const soldOut = {
            productId: 2, name: 'Test', description: '', mrp: 500, sellingPrice: 400,
            stockQuantity: 0, thresholdQuantity: 1, isActive: true, categoryId: 1, sellerId: 1,
        };
        expect(component.isSoldOut(soldOut)).toBe(true);
    });
});
