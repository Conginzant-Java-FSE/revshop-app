import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { NotificationService, NotificationDTO } from './notification.service';

describe('NotificationService', () => {
    let service: NotificationService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                NotificationService
            ]
        });

        service = TestBed.inject(NotificationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get notifications for a user', () => {
        const mockNotifications: NotificationDTO[] = [
            { notificationId: 1, userId: 1, title: 'Order Shipped', message: 'Your order has shipped', isRead: false, createdAt: '2025-01-01' },
            { notificationId: 2, userId: 1, title: 'Order Delivered', message: 'Your order was delivered', isRead: true, createdAt: '2025-01-02' }
        ];

        service.getNotifications(1).subscribe(res => {
            expect(res.data.length).toBe(2);
            expect(res.data[0].title).toBe('Order Shipped');
            expect(res.data[1].isRead).toBeTrue();
        });

        const req = httpMock.expectOne('/api/notifications/user/1');
        expect(req.request.method).toBe('GET');
        req.flush({ message: 'OK', data: mockNotifications });
    });

    it('should mark notification as read', () => {
        service.markAsRead(5).subscribe(res => {
            expect(res.message).toBe('OK');
        });

        const req = httpMock.expectOne('/api/notifications/5/read');
        expect(req.request.method).toBe('PUT');
        req.flush({ message: 'OK', data: null });
    });

    it('should delete a notification', () => {
        service.deleteNotification(3).subscribe(res => {
            expect(res.message).toBe('OK');
        });

        const req = httpMock.expectOne('/api/notifications/3');
        expect(req.request.method).toBe('DELETE');
        req.flush({ message: 'OK', data: null });
    });

    it('should emit on triggerRefresh', (done) => {
        service.refresh$.subscribe(() => {
            expect(true).toBeTrue();
            done();
        });

        service.triggerRefresh();
    });
});
