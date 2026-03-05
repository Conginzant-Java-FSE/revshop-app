import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BuyerDashboardComponent } from './buyer-dashboard';
import { AuthService } from '../../services/auth';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { OrderService } from '../../services/order';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

describe('BuyerDashboardComponent', () => {
    let component: BuyerDashboardComponent;
    let fixture: ComponentFixture<BuyerDashboardComponent>;
    let mockAuthService: any;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockOrderService: jasmine.SpyObj<OrderService>;

    beforeEach(async () => {
        mockAuthService = {
            authState: () => ({ token: 'test-token', role: 'BUYER', userId: '1', name: 'Test' }),
            isLoggedIn: () => true,
            userRole: () => 'BUYER',
            logout: jasmine.createSpy('logout')
        };
        mockOrderService = jasmine.createSpyObj('OrderService', ['getOrdersByUserId']);
        mockOrderService.getOrdersByUserId.and.returnValue(of({ message: 'OK', data: [] }));

        spyOn(localStorage, 'getItem').and.callFake((key: string) => {
            if (key === 'userId') return '1';
            return null;
        });

        await TestBed.configureTestingModule({
            imports: [BuyerDashboardComponent, RouterTestingModule],
            providers: [
                { provide: AuthService, useValue: mockAuthService },
                { provide: OrderService, useValue: mockOrderService }
            ]
        })
            .overrideComponent(BuyerDashboardComponent, {
                remove: { imports: [] },
                add: { imports: [RouterTestingModule] }
            })
            .compileComponents();

        fixture = TestBed.createComponent(BuyerDashboardComponent);
        component = fixture.componentInstance;
        spyOn(component['router'], 'navigate').and.stub();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load buyer data on init', () => {
        const mockOrders = [
            { orderId: 1, orderNumber: 'ORD-001', totalAmount: 100, status: 'DELIVERED', orderDate: '2025-01-01' },
            { orderId: 2, orderNumber: 'ORD-002', totalAmount: 200, status: 'PROCESSING', orderDate: '2025-01-02' }
        ];
        mockOrderService.getOrdersByUserId.and.returnValue(of({ message: 'OK', data: mockOrders }));

        component.ngOnInit();

        expect(mockOrderService.getOrdersByUserId).toHaveBeenCalledWith(1);
        expect(component.recentOrders().length).toBe(2);
        expect(component.loading()).toBeFalse();
    });

    it('should limit recent orders to 5', () => {
        const mockOrders = Array.from({ length: 10 }, (_, i) => ({
            orderId: i, orderNumber: `ORD-${i}`, totalAmount: 100, status: 'DELIVERED', orderDate: '2025-01-01'
        }));
        mockOrderService.getOrdersByUserId.and.returnValue(of({ message: 'OK', data: mockOrders }));

        component.ngOnInit();

        expect(component.recentOrders().length).toBe(5);
    });

    it('should handle error when loading orders', () => {
        mockOrderService.getOrdersByUserId.and.returnValue(throwError(() => new Error('fail')));

        component.ngOnInit();

        expect(component.loading()).toBeFalse();
    });

    it('should call logout and navigate to home on onLogout', () => {
        component.onLogout();
        expect(mockAuthService.logout).toHaveBeenCalled();
        expect(component['router'].navigate).toHaveBeenCalledWith(['/']);
    });
});
