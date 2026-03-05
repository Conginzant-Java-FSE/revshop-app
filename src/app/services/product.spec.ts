import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService, ProductDTO, Page } from './product';
import { ApiResponse } from '../models/api-response.model';

describe('ProductService', () => {
    let service: ProductService;
    let httpMock: HttpTestingController;

    const mockProduct: ProductDTO = {
        productId: 1,
        name: 'Laptop',
        description: 'A powerful laptop',
        mrp: 1200,
        sellingPrice: 1000,
        stockQuantity: 10,
        thresholdQuantity: 2,
        isActive: true,
        categoryId: 5,
        sellerId: 10
    };

    const mockPage: Page<ProductDTO> = {
        content: [mockProduct],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0
    };

    const mockApiResponse: ApiResponse<Page<ProductDTO>> = {
        message: 'Success',
        data: mockPage
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ProductService]
        });
        service = TestBed.inject(ProductService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify(); // Ensure no outstanding requests
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getAllProducts() should call the correct API endpoint and return Page of products', () => {
        service.getAllProducts(0, 10, 'price', 'desc').subscribe(res => {
            expect(res.data).toEqual(mockPage);
        });

        const req = httpMock.expectOne({ method: 'GET' }, 'call to /api/products');
        expect(req.request.url).toBe('/api/products');
        expect(req.request.params.get('page')).toBe('0');
        expect(req.request.params.get('size')).toBe('10');
        expect(req.request.params.get('sortBy')).toBe('price');
        expect(req.request.params.get('direction')).toBe('desc');

        req.flush(mockApiResponse);
    });

    it('searchProducts() should send query parameters correctly', () => {
        service.searchProducts('laptop', 1, 20).subscribe(res => {
            expect(res.data?.content.length).toBe(1);
        });

        const req = httpMock.expectOne(req => req.url === '/api/products/search');
        expect(req.request.method).toBe('GET');
        expect(req.request.params.get('keyword')).toBe('laptop');
        expect(req.request.params.get('page')).toBe('1');
        expect(req.request.params.get('size')).toBe('20');

        req.flush(mockApiResponse);
    });

    it('filterProducts() should apply category or filter parameters', () => {
        const filters = { minPrice: 100, maxPrice: 1500, categoryId: 5 };

        service.filterProducts(filters, 0, 12).subscribe(res => {
            expect(res.data?.content.length).toBe(1);
        });

        const req = httpMock.expectOne(req => req.url === '/api/products/filter');
        expect(req.request.method).toBe('GET');
        expect(req.request.params.get('page')).toBe('0');
        expect(req.request.params.get('size')).toBe('12');
        expect(req.request.params.get('minPrice')).toBe('100');
        expect(req.request.params.get('maxPrice')).toBe('1500');
        expect(req.request.params.get('categoryId')).toBe('5');

        req.flush(mockApiResponse);
    });

    it('filterProducts() should handle partial filters correctly', () => {
        const filters = { categoryId: 3 };

        service.filterProducts(filters, 0, 10).subscribe();

        const req = httpMock.expectOne(req => req.url === '/api/products/filter');
        expect(req.request.params.has('minPrice')).toBeFalse();
        expect(req.request.params.has('maxPrice')).toBeFalse();
        expect(req.request.params.get('categoryId')).toBe('3');

        req.flush(mockApiResponse);
    });

    it('getProductById() should request the correct product ID', () => {
        const singleProductRes: ApiResponse<ProductDTO> = { message: 'Ok', data: mockProduct };

        service.getProductById(42).subscribe(res => {
            expect(res.data).toEqual(mockProduct);
        });

        const req = httpMock.expectOne('/api/products/42');
        expect(req.request.method).toBe('GET');
        req.flush(singleProductRes);
    });

});
