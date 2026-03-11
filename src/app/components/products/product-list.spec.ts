import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProductListComponent } from './product-list';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { ProductService, ProductDTO, Page } from '../../services/product';
import { CategoryService, CategoryDTO } from '../../services/category';
import { CartService } from '../../services/cart';
import { ToastService } from '../../services/toast';
import { of } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';

// ─── Sample test data ────────────────────────────────────────────────────────

const MOCK_PRODUCT: ProductDTO = {
    productId: 1,
    name: 'Test Product',
    description: 'A test product',
    mrp: 100,
    sellingPrice: 80,
    stockQuantity: 10,
    thresholdQuantity: 2,
    imageUrl: 'img.jpg',
    isActive: true,
    categoryId: 1,
    sellerId: 1,
    categoryName: 'Electronics',
    sellerName: 'Seller A'
};

const MOCK_PAGE: Page<ProductDTO> = {
    content: [MOCK_PRODUCT],
    totalElements: 1,
    totalPages: 1,
    size: 12,
    number: 0
};

const MOCK_CATEGORY: CategoryDTO = { categoryId: 1, name: 'Electronics', description: 'Gadgets' };

// ─── Mock services ────────────────────────────────────────────────────────────

function makeProductServiceMock(): jasmine.SpyObj<ProductService> {
    const spy = jasmine.createSpyObj('ProductService', [
        'getAllProducts',
        'searchProducts',
        'filterProducts'
    ]);
    spy.getAllProducts.and.returnValue(of<ApiResponse<Page<ProductDTO>>>({ message: 'ok', data: MOCK_PAGE }));
    spy.searchProducts.and.returnValue(of<ApiResponse<Page<ProductDTO>>>({ message: 'ok', data: MOCK_PAGE }));
    spy.filterProducts.and.returnValue(of<ApiResponse<Page<ProductDTO>>>({ message: 'ok', data: MOCK_PAGE }));
    return spy;
}

function makeCategoryServiceMock(): jasmine.SpyObj<CategoryService> {
    const spy = jasmine.createSpyObj('CategoryService', ['getAllCategories']);
    spy.getAllCategories.and.returnValue(of<ApiResponse<CategoryDTO[]>>({ message: 'ok', data: [MOCK_CATEGORY] }));
    return spy;
}

function makeCartServiceMock(): jasmine.SpyObj<CartService> {
    const spy = jasmine.createSpyObj('CartService', ['addItemToCart']);
    spy.addItemToCart.and.returnValue(of({ message: 'ok', data: {} }));
    return spy;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ProductListComponent', () => {
    let component: ProductListComponent;
    let fixture: ComponentFixture<ProductListComponent>;
    let productService: jasmine.SpyObj<ProductService>;
    let categoryService: jasmine.SpyObj<CategoryService>;
    let cartService: jasmine.SpyObj<CartService>;
    let toastService: jasmine.SpyObj<ToastService>;

    beforeEach(async () => {
        productService = makeProductServiceMock();
        categoryService = makeCategoryServiceMock();
        cartService = makeCartServiceMock();
        toastService = jasmine.createSpyObj('ToastService', ['success', 'error']);

        await TestBed.configureTestingModule({
            imports: [ProductListComponent],
            providers: [
                provideRouter([]),
                {
                    provide: ActivatedRoute,
                    useValue: { queryParams: of({}) }
                },
                { provide: ProductService, useValue: productService },
                { provide: CategoryService, useValue: categoryService },
                { provide: CartService, useValue: cartService },
                { provide: ToastService, useValue: toastService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ProductListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        await fixture.whenStable();
    });

    // ── Creation ──────────────────────────────────────────────────────────────

    it('should create the product list component', () => {
        expect(component).toBeTruthy();
    });

    // ── Initial state ─────────────────────────────────────────────────────────

    it('should initialise signals with correct default values', () => {
        expect(component.keyword()).toBe('');
        expect(component.currentPage()).toBe(0);
        expect(component.pageSize).toBe(12);
        expect(component.sortOption()).toBe('productId_asc');
    });

    // ── Data loading ──────────────────────────────────────────────────────────

    it('should call getAllProducts on init', () => {
        expect(productService.getAllProducts).toHaveBeenCalled();
    });

    it('should populate the products signal after load', () => {
        expect(component.products()).toEqual([MOCK_PRODUCT]);
    });

    it('should set loading to false after products load', () => {
        expect(component.loading()).toBeFalse();
    });

    it('should populate the categories signal after load', () => {
        expect(component.categories()).toEqual([MOCK_CATEGORY]);
    });

    it('should set totalPages after product load', () => {
        expect(component.totalPages()).toBe(1);
    });

    it('should set totalElements after product load', () => {
        expect(component.totalElements()).toBe(1);
    });

    // ── Search ────────────────────────────────────────────────────────────────

    it('should call searchProducts when onSearch is called with non-empty keyword', () => {
        component.keyword.set('laptop');
        component.onSearch();
        expect(productService.searchProducts).toHaveBeenCalledWith('laptop', 0, 12, 'productId', 'asc');
    });

    it('should call getAllProducts when onSearch is called with empty keyword', () => {
        component.keyword.set('');
        productService.getAllProducts.calls.reset();
        component.onSearch();
        expect(productService.getAllProducts).toHaveBeenCalled();
    });

    // ── Filtering ─────────────────────────────────────────────────────────────

    it('should call filterProducts when onFilter is called', () => {
        component.minPrice.set(10);
        component.maxPrice.set(500);
        component.categoryId.set(1);
        component.onFilter();
        expect(productService.filterProducts).toHaveBeenCalledWith(
            { minPrice: 10, maxPrice: 500, categoryId: 1, minRating: undefined, minDiscount: undefined, dynamicFilters: {} },
            0,
            12,
            'productId',
            'asc'
        );
    });

    it('should reset currentPage to 0 on filter', () => {
        component.currentPage.set(2);
        component.onFilter();
        expect(component.currentPage()).toBe(0);
    });

    // ── Sorting ───────────────────────────────────────────────────────────────

    it('should reload products when onSortChange is called', () => {
        productService.getAllProducts.calls.reset();
        component.sortOption.set('sellingPrice_desc');
        component.onSortChange();
        expect(productService.getAllProducts).toHaveBeenCalled();
    });

    it('should reset currentPage to 0 on sort change', () => {
        component.currentPage.set(3);
        component.onSortChange();
        expect(component.currentPage()).toBe(0);
    });

    // ── Pagination ────────────────────────────────────────────────────────────

    it('should increment page on nextPage when totalPages allows', () => {
        component.totalPages.set(3);
        component.currentPage.set(0);
        component.nextPage();
        expect(component.currentPage()).toBe(1);
    });

    it('should decrement page on previousPage when page > 0', () => {
        component.totalPages.set(3);
        component.currentPage.set(2);
        component.previousPage();
        expect(component.currentPage()).toBe(1);
    });

    it('should NOT decrement below page 0 on previousPage', () => {
        component.currentPage.set(0);
        component.previousPage();
        expect(component.currentPage()).toBe(0);
    });

    // ── clearFilters ──────────────────────────────────────────────────────────

    it('should reset all filters on clearFilters', () => {
        component.keyword.set('test');
        component.minPrice.set(5);
        component.maxPrice.set(200);
        component.categoryId.set(2);
        component.currentPage.set(3);
        component.clearFilters();
        expect(component.keyword()).toBe('');
        expect(component.minPrice()).toBeUndefined();
        expect(component.maxPrice()).toBeUndefined();
        expect(component.categoryId()).toBeUndefined();
        expect(component.currentPage()).toBe(0);
    });

    // ── Add to cart ───────────────────────────────────────────────────────────

    it('should show toast message if no userId when addToCart is called', () => {
        spyOn(localStorage, 'getItem').and.returnValue(null);
        component.addToCart(MOCK_PRODUCT);
        expect(toastService.success).toHaveBeenCalledWith('Please login to add items to cart');
    });

    it('should call cartService.addItemToCart when user is logged in', fakeAsync(() => {
        spyOn(localStorage, 'getItem').and.returnValue('7');
        component.addToCart(MOCK_PRODUCT);
        tick();
        expect(cartService.addItemToCart).toHaveBeenCalledWith(7, 1, 1);
    }));
});
