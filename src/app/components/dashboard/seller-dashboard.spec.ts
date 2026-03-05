import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SellerDashboardComponent } from './seller-dashboard';
import { AuthService } from '../../services/auth';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ProductService } from '../../services/product';
import { OrderService } from '../../services/order';
import { ToastService } from '../../services/toast';
import { ShipperService } from '../../services/shipper.service';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

describe('SellerDashboardComponent', () => {
    let component: SellerDashboardComponent;
    let fixture: ComponentFixture<SellerDashboardComponent>;
    let mockAuthService: any;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockProductService: jasmine.SpyObj<ProductService>;
    let mockOrderService: jasmine.SpyObj<OrderService>;
    let mockToastService: jasmine.SpyObj<ToastService>;
    let mockShipperService: jasmine.SpyObj<ShipperService>;

    beforeEach(async () => {
        mockAuthService = {
            authState: () => ({ token: 'test-token', role: 'SELLER', userId: '1', name: 'Seller' }),
            isLoggedIn: () => true,
            userRole: () => 'SELLER',
            logout: jasmine.createSpy('logout')
        };
        mockProductService = jasmine.createSpyObj('ProductService', ['getProductsBySeller', 'toggleActive', 'deleteProduct']);
        mockOrderService = jasmine.createSpyObj('OrderService', ['getSellerOrders', 'getSellerStats', 'updateOrderStatus']);
        mockToastService = jasmine.createSpyObj('ToastService', ['success', 'error']);
        mockShipperService = jasmine.createSpyObj('ShipperService', ['getAvailableShippers', 'assignShipper']);

        mockProductService.getProductsBySeller.and.returnValue(of({ message: 'OK', data: { content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 } as any }));
        mockOrderService.getSellerStats.and.returnValue(of({ message: 'OK', data: {} }));
        mockOrderService.getSellerOrders.and.returnValue(of({ message: 'OK', data: [] }));

        spyOn(localStorage, 'getItem').and.callFake((key: string) => {
            if (key === 'userId') return '1';
            return null;
        });

        await TestBed.configureTestingModule({
            imports: [SellerDashboardComponent, RouterTestingModule],
            providers: [
                { provide: AuthService, useValue: mockAuthService },
                { provide: ProductService, useValue: mockProductService },
                { provide: OrderService, useValue: mockOrderService },
                { provide: ToastService, useValue: mockToastService },
                { provide: ShipperService, useValue: mockShipperService }
            ]
        })
            .overrideComponent(SellerDashboardComponent, {
                remove: { imports: [] },
                add: { imports: [RouterTestingModule] }
            })
            .compileComponents();

        fixture = TestBed.createComponent(SellerDashboardComponent);
        component = fixture.componentInstance;
        spyOn(component['router'], 'navigate').and.stub();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load products, stats, and orders on init', () => {
        component.ngOnInit();
        expect(mockProductService.getProductsBySeller).toHaveBeenCalledWith(1);
        expect(mockOrderService.getSellerStats).toHaveBeenCalledWith(1);
        expect(mockOrderService.getSellerOrders).toHaveBeenCalledWith(1);
    });

    it('should handle product loading error', () => {
        mockProductService.getProductsBySeller.and.returnValue(throwError(() => new Error('fail')));
        component.ngOnInit();
        expect(mockToastService.error).toHaveBeenCalledWith('Failed to load products');
        expect(component.loadingProducts()).toBeFalse();
    });

    it('should handle orders loading error', () => {
        mockOrderService.getSellerOrders.and.returnValue(throwError(() => new Error('fail')));
        component.ngOnInit();
        expect(mockToastService.error).toHaveBeenCalledWith('Failed to load orders');
    });

    it('should navigate to edit product page', () => {
        component.editProduct(5);
        expect(component['router'].navigate).toHaveBeenCalledWith(['/products/edit', 5]);
    });

    it('should toggle product active status', () => {
        mockProductService.toggleActive.and.returnValue(of({ message: 'OK', data: { productId: 1 } as any }));
        const product = { productId: 1, name: 'Test', isActive: true } as any;

        component.toggleActive(product);

        expect(mockProductService.toggleActive).toHaveBeenCalledWith(1);
        expect(mockToastService.success).toHaveBeenCalledWith('Product deactivated successfully');
    });

    it('should handle toggle active error', () => {
        mockProductService.toggleActive.and.returnValue(throwError(() => new Error('fail')));
        const product = { productId: 1, name: 'Test', isActive: true } as any;

        component.toggleActive(product);

        expect(mockToastService.error).toHaveBeenCalledWith('Failed to toggle product status');
    });

    it('should open and close shipper modal', () => {
        mockShipperService.getAvailableShippers.and.returnValue(of({ message: 'OK', data: [] }));

        component.openShipperModal(10);
        expect(component.showShipperModal()).toBeTrue();
        expect(component.assigningOrderId()).toBe(10);

        component.closeShipperModal();
        expect(component.showShipperModal()).toBeFalse();
        expect(component.assigningOrderId()).toBeNull();
    });

    it('should show error when confirming without selecting shipper', () => {
        component.confirmAssignShipper();
        expect(mockToastService.error).toHaveBeenCalledWith('Please select a shipper');
    });

    it('should assign shipper successfully', () => {
        mockShipperService.assignShipper.and.returnValue(of({ message: 'OK', data: null }));
        component.selectedShipperId.set(5);
        component.assigningOrderId.set(10);

        component.confirmAssignShipper();

        expect(mockShipperService.assignShipper).toHaveBeenCalledWith(5, 10);
        expect(mockToastService.success).toHaveBeenCalledWith('Shipper assigned successfully!');
    });

    it('should accept return', () => {
        mockOrderService.updateOrderStatus.and.returnValue(of({ message: 'OK', data: {} as any }));
        component.sellerId = 1;

        component.acceptReturn(10);

        expect(mockOrderService.updateOrderStatus).toHaveBeenCalledWith(10, 'RETURN_APPROVED', 1);
        expect(mockToastService.success).toHaveBeenCalledWith('Return accepted');
    });

    it('should reject return', () => {
        mockOrderService.updateOrderStatus.and.returnValue(of({ message: 'OK', data: {} as any }));
        component.sellerId = 1;

        component.rejectReturn(10);

        expect(mockOrderService.updateOrderStatus).toHaveBeenCalledWith(10, 'RETURN_REJECTED', 1);
        expect(mockToastService.success).toHaveBeenCalledWith('Return rejected');
    });

    it('should return statusEntries', () => {
        component.stats.set({ ordersByStatus: { DELIVERED: 5, PROCESSING: 3 } });
        const entries = component.statusEntries();
        expect(entries.length).toBe(2);
        expect(entries).toContain(jasmine.objectContaining({ key: 'DELIVERED', value: 5 }));
    });

    it('should return empty array for statusEntries when no stats', () => {
        component.stats.set(null);
        expect(component.statusEntries()).toEqual([]);
    });

    it('should call logout and navigate to home', () => {
        component.onLogout();
        expect(mockAuthService.logout).toHaveBeenCalled();
        expect(component['router'].navigate).toHaveBeenCalledWith(['/']);
    });
});
