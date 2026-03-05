import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CouponService, CouponValidationResult } from './coupon.service';
import { ApiResponse } from '../models/api-response.model';

describe('CouponService', () => {
    let service: CouponService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [CouponService]
        });
        service = TestBed.inject(CouponService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should validate coupon', () => {
        const mockResult: CouponValidationResult = {
            valid: true,
            discountAmount: 50,
            message: 'Coupon applied!'
        };
        const mockResponse: ApiResponse<CouponValidationResult> = { message: 'Success', data: mockResult };

        service.validateCoupon('SAVE50', 500).subscribe(res => {
            expect(res.data.valid).toBe(true);
            expect(res.data.discountAmount).toBe(50);
        });

        const req = httpMock.expectOne('/api/coupons/validate');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ code: 'SAVE50', orderAmount: 500 });
        req.flush(mockResponse);
    });
});
