import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ShipperService, ShipperDTO } from './shipper.service';

describe('ShipperService', () => {
    let service: ShipperService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                ShipperService
            ]
        });

        service = TestBed.inject(ShipperService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get all shippers', () => {
        const mockShippers: ShipperDTO[] = [
            { shipperId: 1, name: 'Shipper A', phone: '1234567890', email: 'a@test.com', vehicleNumber: 'KA-01', isAvailable: true }
        ];

        service.getAllShippers().subscribe(res => {
            expect(res.data.length).toBe(1);
            expect(res.data[0].name).toBe('Shipper A');
        });

        const req = httpMock.expectOne('/api/shippers');
        expect(req.request.method).toBe('GET');
        req.flush({ message: 'OK', data: mockShippers });
    });

    it('should get available shippers', () => {
        service.getAvailableShippers().subscribe(res => {
            expect(res.data).toBeDefined();
        });

        const req = httpMock.expectOne('/api/shippers/available');
        expect(req.request.method).toBe('GET');
        req.flush({ message: 'OK', data: [] });
    });

    it('should assign shipper to order', () => {
        service.assignShipper(1, 10).subscribe(res => {
            expect(res.message).toBe('OK');
        });

        const req = httpMock.expectOne('/api/shippers/1/assign/10');
        expect(req.request.method).toBe('POST');
        req.flush({ message: 'OK', data: null });
    });

    it('should create shipper', () => {
        const newShipper: Partial<ShipperDTO> = { name: 'New Shipper', email: 'new@test.com' };

        service.createShipper(newShipper).subscribe(res => {
            expect(res.data.name).toBe('New Shipper');
        });

        const req = httpMock.expectOne('/api/shippers');
        expect(req.request.method).toBe('POST');
        req.flush({ message: 'OK', data: { shipperId: 1, name: 'New Shipper', email: 'new@test.com' } });
    });

    it('should login shipper', () => {
        service.loginShipper('test@test.com', 'password').subscribe(res => {
            expect(res.data.token).toBe('abc');
        });

        const req = httpMock.expectOne('/api/auth/login/shipper');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ email: 'test@test.com', password: 'password' });
        req.flush({ message: 'OK', data: { token: 'abc', shipperId: 1 } });
    });

    it('should register shipper', () => {
        const data = { name: 'Test', email: 'test@test.com', phone: '1234567890', vehicleNumber: 'KA-01', password: 'pass123' };

        service.registerShipper(data).subscribe(res => {
            expect(res.data.shipperId).toBe(1);
        });

        const req = httpMock.expectOne('/api/auth/register/shipper');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(data);
        req.flush({ message: 'OK', data: { shipperId: 1, name: 'Test' } });
    });

    it('should get orders by shipper', () => {
        service.getOrdersByShipper(1).subscribe(res => {
            expect(res.data.length).toBe(0);
        });

        const req = httpMock.expectOne('/api/shippers/1/orders');
        expect(req.request.method).toBe('GET');
        req.flush({ message: 'OK', data: [] });
    });

    it('should update order status', () => {
        service.updateOrderStatus(1, 5, 'SHIPPED').subscribe(res => {
            expect(res.message).toBe('OK');
        });

        const req = httpMock.expectOne(r => r.url === '/api/shippers/1/orders/5/status');
        expect(req.request.method).toBe('PATCH');
        expect(req.request.params.get('status')).toBe('SHIPPED');
        req.flush({ message: 'OK', data: null });
    });

    it('should update availability', () => {
        service.updateAvailability(1, false).subscribe(res => {
            expect(res.message).toBe('OK');
        });

        const req = httpMock.expectOne(r => r.url === '/api/shippers/1/availability');
        expect(req.request.method).toBe('PATCH');
        expect(req.request.params.get('available')).toBe('false');
        req.flush({ message: 'OK', data: null });
    });
});
