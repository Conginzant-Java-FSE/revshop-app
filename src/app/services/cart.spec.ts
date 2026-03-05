import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CartService, CartDTO } from './cart';
import { ApiResponse } from '../models/api-response.model';

describe('CartService', () => {
    let service: CartService;
    let httpMock: HttpTestingController;

    const mockCart: CartDTO = {
        cartId: 1,
        totalPrice: 100,
        items: []
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [CartService]
        });
        service = TestBed.inject(CartService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch cart by user ID', () => {
        const mockResponse: ApiResponse<CartDTO> = { message: 'Success', data: mockCart };
        service.getCartByUserId(1).subscribe(res => {
            expect(res.data).toEqual(mockCart);
        });

        const req = httpMock.expectOne('/api/carts/user/1');
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('should add item to cart', () => {
        service.addItemToCart(1, 101, 2).subscribe(res => {
            expect(res.message).toBe('Added');
        });

        const req = httpMock.expectOne('/api/carts/user/1/add');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ productId: 101, quantity: 2 });
        req.flush({ message: 'Added' });
    });
});
