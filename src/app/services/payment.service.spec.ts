import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PaymentService, RazorpayOrderResponse } from './payment.service';
import { ApiResponse } from '../models/api-response.model';

describe('PaymentService', () => {
    let service: PaymentService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [PaymentService]
        });
        service = TestBed.inject(PaymentService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create Razorpay order', () => {
        const mockResp: RazorpayOrderResponse = {
            razorpayOrderId: 'rzp_123',
            amount: 10000,
            currency: 'INR',
            keyId: 'key_123'
        };
        const mockResponse: ApiResponse<RazorpayOrderResponse> = { message: 'Success', data: mockResp };

        service.createRazorpayOrder(100, 1).subscribe(res => {
            expect(res.data.razorpayOrderId).toBe('rzp_123');
        });

        const req = httpMock.expectOne('/api/payments/create-order');
        expect(req.request.method).toBe('POST');
        expect(req.request.body.amount).toBe(10000);
        req.flush(mockResponse);
    });
});
