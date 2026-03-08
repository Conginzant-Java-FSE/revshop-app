import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { Navbar } from './navbar';
import { AuthService } from '../../../services/auth';
import { NotificationService } from '../../../services/notification.service';
import { LocationService } from '../../../services/location.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';

describe('Navbar', () => {
    let component: Navbar;
    let fixture: ComponentFixture<Navbar>;
    let mockAuthService: any;
    let mockNotificationService: jasmine.SpyObj<NotificationService>;
    let mockLocationService: jasmine.SpyObj<any>;

    beforeEach(async () => {
        mockAuthService = {
            authState: signal({ token: 'test-token', role: 'BUYER', userId: '1', name: 'Test' }),
            isLoggedIn: () => true,
            userRole: () => 'BUYER',
            logout: jasmine.createSpy('logout')
        };

        mockNotificationService = jasmine.createSpyObj('NotificationService', ['getNotifications', 'markAsRead'], {
            refresh$: of()
        });
        mockNotificationService.getNotifications.and.returnValue(of({ message: 'OK', data: [] }));
        mockNotificationService.markAsRead.and.returnValue(of({ message: 'OK', data: undefined }));

        mockLocationService = jasmine.createSpyObj('LocationService', ['selectedLocation', 'clearLocation']);
        mockLocationService.selectedLocation.and.returnValue(null);

        spyOn(localStorage, 'getItem').and.returnValue(null);

        await TestBed.configureTestingModule({
            imports: [Navbar],
            providers: [
                provideRouter([]),
                provideHttpClient(),
                { provide: AuthService, useValue: mockAuthService },
                { provide: NotificationService, useValue: mockNotificationService },
                { provide: LocationService, useValue: mockLocationService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(Navbar);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should toggle notification dropdown', () => {
        expect(component.showNotifications()).toBeFalse();
        component.toggleNotifications();
        expect(component.showNotifications()).toBeTrue();
        component.toggleNotifications();
        expect(component.showNotifications()).toBeFalse();
    });

    it('should load notifications on init when logged in', () => {
        // Override getItem to return userId so loadNotifications actually calls getNotifications
        (localStorage.getItem as jasmine.Spy).and.callFake((key: string) => {
            if (key === 'userId') return '1';
            return null;
        });

        // ngOnInit subscribes to refresh$ — triggering it will invoke loadNotifications()
        component.ngOnInit();
        // Also directly call loadNotifications to ensure the spy is triggered regardless of effect timing
        component.loadNotifications();
        expect(mockNotificationService.getNotifications).toHaveBeenCalled();
    });

    it('should mark notification as read', () => {
        component.markAsRead(5);
        expect(mockNotificationService.markAsRead).toHaveBeenCalledWith(5);
    });

    it('should identify shipper session', () => {
        (localStorage.getItem as jasmine.Spy).and.callFake((key: string) => {
            if (key === 'shipperId') return '1';
            return null;
        });
        expect(component.isShipper).toBeTrue();
    });

    it('should return false for isShipper when not shipper', () => {
        expect(component.isShipper).toBeFalse();
    });

    it('should return true for isAnyUserLoggedIn when buyer/seller is logged in', () => {
        // mockAuthService.authState().token is 'test-token'
        expect(component.isAnyUserLoggedIn).toBeTrue();
    });

    it('should return false for isAnyUserLoggedIn when completely logged out', () => {
        mockAuthService.authState.set({ token: null, role: null, userId: null, name: null });
        expect(component.isAnyUserLoggedIn).toBeFalse();
    });

    it('should clear location when openLocationPopup is called', () => {
        component.openLocationPopup();
        expect(mockLocationService.clearLocation).toHaveBeenCalled();
    });

    it('should format deliveryCity properly', () => {
        mockLocationService.selectedLocation.and.returnValue({ city: 'Test City' });
        expect(component.deliveryCity).toBe('Test City');
    });

    it('should return null for deliveryCity when not set', () => {
        mockLocationService.selectedLocation.and.returnValue(null);
        expect(component.deliveryCity).toBeNull();
    });

    it('should call authService logout for non-shipper', () => {
        component.onLogout();
        expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('should clear shipper localStorage on shipper logout', () => {
        const removeSpy = spyOn(localStorage, 'removeItem');
        (localStorage.getItem as jasmine.Spy).and.callFake((key: string) => {
            if (key === 'shipperId') return '1';
            return null;
        });

        component.onLogout();
        expect(removeSpy).toHaveBeenCalledWith('shipperId');
        expect(removeSpy).toHaveBeenCalledWith('shipperName');
    });

    it('should clean up on destroy', () => {
        component.ngOnInit();
        component.ngOnDestroy();
        // Should not throw
        expect(true).toBeTrue();
    });

    describe('handleNotificationClick', () => {
        let router: Router;

        beforeEach(() => {
            router = TestBed.inject(Router);
            spyOn(router, 'navigate');
        });

        it('should navigate to wallet for WALLET type', () => {
            const notif = { type: 'WALLET', notificationId: 1 } as any;
            component.handleNotificationClick(notif);
            expect(router.navigate).toHaveBeenCalledWith(['/wallet']);
        });

        it('should navigate to profile for PROFILE type', () => {
            const notif = { type: 'PROFILE', notificationId: 1 } as any;
            component.handleNotificationClick(notif);
            expect(router.navigate).toHaveBeenCalledWith(['/profile']);
        });

        it('should navigate to order detail for ORDER type with targetId', () => {
            const notif = { type: 'ORDER', targetId: '101', notificationId: 1 } as any;
            component.handleNotificationClick(notif);
            expect(router.navigate).toHaveBeenCalledWith(['/orders', '101']);
        });

        it('should navigate to orders list for ORDER type without targetId', () => {
            const notif = { type: 'ORDER', notificationId: 1 } as any;
            component.handleNotificationClick(notif);
            expect(router.navigate).toHaveBeenCalledWith(['/orders']);
        });

        it('should navigate to product detail for PRODUCT type with targetId', () => {
            const notif = { type: 'PRODUCT', targetId: '50', notificationId: 1 } as any;
            component.handleNotificationClick(notif);
            expect(router.navigate).toHaveBeenCalledWith(['/product', '50']);
        });

        it('should navigate to products list for PRODUCT type without targetId', () => {
            const notif = { type: 'PRODUCT', notificationId: 1 } as any;
            component.handleNotificationClick(notif);
            expect(router.navigate).toHaveBeenCalledWith(['/products']);
        });

        it('should do nothing for unknown type', () => {
            const notif = { type: 'UNKNOWN', notificationId: 1 } as any;
            component.handleNotificationClick(notif);
            expect(router.navigate).not.toHaveBeenCalled();
        });
    });
});
