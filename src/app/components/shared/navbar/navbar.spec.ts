import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { Navbar } from './navbar';
import { AuthService } from '../../../services/auth';
import { NotificationService } from '../../../services/notification.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('Navbar', () => {
    let component: Navbar;
    let fixture: ComponentFixture<Navbar>;
    let mockAuthService: any;
    let mockNotificationService: jasmine.SpyObj<NotificationService>;

    beforeEach(async () => {
        mockAuthService = {
            authState: () => ({ token: 'test-token', role: 'BUYER', userId: '1', name: 'Test' }),
            isLoggedIn: () => true,
            userRole: () => 'BUYER',
            logout: jasmine.createSpy('logout')
        };

        mockNotificationService = jasmine.createSpyObj('NotificationService', ['getNotifications', 'markAsRead'], {
            refresh$: of()
        });
        mockNotificationService.getNotifications.and.returnValue(of({ message: 'OK', data: [] }));
        mockNotificationService.markAsRead.and.returnValue(of({ message: 'OK', data: undefined }));

        spyOn(localStorage, 'getItem').and.returnValue(null);

        await TestBed.configureTestingModule({
            imports: [Navbar],
            providers: [
                provideRouter([]),
                provideHttpClient(),
                { provide: AuthService, useValue: mockAuthService },
                { provide: NotificationService, useValue: mockNotificationService }
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
        spyOn(localStorage, 'setItem');
        (localStorage.getItem as jasmine.Spy).and.callFake((key: string) => {
            if (key === 'userId') return '1';
            return null;
        });

        component.ngOnInit();
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
});
