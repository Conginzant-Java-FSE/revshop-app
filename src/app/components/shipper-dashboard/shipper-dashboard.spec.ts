import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShipperDashboardComponent } from './shipper-dashboard';
import { ShipperService } from '../../services/shipper.service';
import { ToastService } from '../../services/toast';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('ShipperDashboardComponent', () => {
    let component: ShipperDashboardComponent;
    let fixture: ComponentFixture<ShipperDashboardComponent>;
    let mockShipperService: jasmine.SpyObj<ShipperService>;
    let mockToastService: jasmine.SpyObj<ToastService>;
    let mockRouter: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        mockShipperService = jasmine.createSpyObj('ShipperService', [
            'getOrdersByShipper', 'updateOrderStatus', 'updateAvailability'
        ]);
        mockToastService = jasmine.createSpyObj('ToastService', ['success', 'error']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);

        mockShipperService.getOrdersByShipper.and.returnValue(of({ message: 'OK', data: [] }));

        spyOn(localStorage, 'getItem').and.callFake((key: string) => {
            const store: Record<string, string> = {
                shipperId: '1',
                shipperName: 'Test Shipper',
                shipperVehicle: 'KA-01-1234'
            };
            return store[key] || null;
        });

        await TestBed.configureTestingModule({
            imports: [ShipperDashboardComponent],
            providers: [
                { provide: ShipperService, useValue: mockShipperService },
                { provide: ToastService, useValue: mockToastService },
                { provide: Router, useValue: mockRouter }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ShipperDashboardComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should redirect to shipper-login if no shipperId', () => {
        (localStorage.getItem as jasmine.Spy).and.returnValue(null);
        component.ngOnInit();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/shipper-login']);
    });

    it('should load orders on init', () => {
        component.ngOnInit();
        expect(mockShipperService.getOrdersByShipper).toHaveBeenCalledWith(1);
    });

    it('should set shipper details on init', () => {
        component.ngOnInit();
        expect(component.shipperName()).toBe('Test Shipper');
        expect(component.shipperVehicle()).toBe('KA-01-1234');
        expect(component.shipperId()).toBe(1);
    });

    it('should handle orders loading error', () => {
        mockShipperService.getOrdersByShipper.and.returnValue(throwError(() => new Error('fail')));
        component.ngOnInit();
        expect(mockToastService.error).toHaveBeenCalledWith('Failed to load orders');
        expect(component.loading()).toBeFalse();
    });

    it('should set tab correctly', () => {
        component.setTab('pending');
        expect(component.activeTab()).toBe('pending');

        component.setTab('delivered');
        expect(component.activeTab()).toBe('delivered');
    });

    it('should filter pending orders', () => {
        component.allOrders.set([
            { orderId: 1, orderNumber: 'O1', status: 'SHIPPED', totalAmount: 100, customerName: 'A', customerPhone: '123', orderDate: '' },
            { orderId: 2, orderNumber: 'O2', status: 'DELIVERED', totalAmount: 200, customerName: 'B', customerPhone: '456', orderDate: '' },
            { orderId: 3, orderNumber: 'O3', status: 'OUT_FOR_DELIVERY', totalAmount: 300, customerName: 'C', customerPhone: '789', orderDate: '' }
        ]);
        expect(component.pendingOrders().length).toBe(2);
        expect(component.deliveredOrders().length).toBe(1);
    });

    it('should update order status', () => {
        mockShipperService.updateOrderStatus.and.returnValue(of({ message: 'OK', data: null }));
        component.shipperId.set(1);
        const order = { orderId: 5, orderNumber: 'O5', status: 'SHIPPED', totalAmount: 100, customerName: 'A', customerPhone: '123', orderDate: '' };

        component.updateStatus(order, 'OUT_FOR_DELIVERY');

        expect(mockShipperService.updateOrderStatus).toHaveBeenCalledWith(1, 5, 'OUT_FOR_DELIVERY');
        expect(mockToastService.success).toHaveBeenCalledWith('Order #O5 updated to OUT_FOR_DELIVERY');
    });

    it('should handle update status error', () => {
        mockShipperService.updateOrderStatus.and.returnValue(throwError(() => new Error('fail')));
        component.shipperId.set(1);
        const order = { orderId: 5, orderNumber: 'O5', status: 'SHIPPED', totalAmount: 100, customerName: 'A', customerPhone: '123', orderDate: '' };

        component.updateStatus(order, 'OUT_FOR_DELIVERY');

        expect(mockToastService.error).toHaveBeenCalledWith('Failed to update order status');
        expect(component.updatingOrderId()).toBeNull();
    });

    it('should return correct next status', () => {
        expect(component.getNextStatus('PROCESSING')).toEqual({ label: 'Mark as Picked Up', value: 'SHIPPED', color: 'blue' });
        expect(component.getNextStatus('SHIPPED')).toEqual({ label: 'Out for Delivery', value: 'OUT_FOR_DELIVERY', color: 'orange' });
        expect(component.getNextStatus('OUT_FOR_DELIVERY')).toEqual({ label: 'Mark as Delivered', value: 'DELIVERED', color: 'green' });
        expect(component.getNextStatus('DELIVERED')).toBeNull();
    });

    it('should return correct status color', () => {
        expect(component.getStatusColor('PROCESSING')).toBe('status-processing');
        expect(component.getStatusColor('SHIPPED')).toBe('status-shipped');
        expect(component.getStatusColor('DELIVERED')).toBe('status-delivered');
        expect(component.getStatusColor('CANCELLED')).toBe('status-cancelled');
        expect(component.getStatusColor('UNKNOWN')).toBe('status-pending');
    });

    it('should return correct status icon', () => {
        expect(component.getStatusIcon('PROCESSING')).toBe('📦');
        expect(component.getStatusIcon('SHIPPED')).toBe('🚚');
        expect(component.getStatusIcon('OUT_FOR_DELIVERY')).toBe('🛵');
        expect(component.getStatusIcon('DELIVERED')).toBe('✅');
        expect(component.getStatusIcon('CANCELLED')).toBe('❌');
        expect(component.getStatusIcon('UNKNOWN')).toBe('⏳');
    });

    it('should return correct tracking step', () => {
        expect(component.getTrackingStep('PENDING')).toBe(0);
        expect(component.getTrackingStep('PROCESSING')).toBe(1);
        expect(component.getTrackingStep('SHIPPED')).toBe(2);
        expect(component.getTrackingStep('OUT_FOR_DELIVERY')).toBe(3);
        expect(component.getTrackingStep('DELIVERED')).toBe(4);
        expect(component.getTrackingStep('UNKNOWN')).toBe(0);
    });

    it('should toggle availability', () => {
        mockShipperService.updateAvailability.and.returnValue(of({ message: 'OK', data: {} as any }));
        component.shipperId.set(1);
        component.isAvailable.set(true);

        component.toggleAvailability();

        expect(mockShipperService.updateAvailability).toHaveBeenCalledWith(1, false);
        expect(component.isAvailable()).toBeFalse();
        expect(mockToastService.success).toHaveBeenCalledWith('You are now unavailable');
    });

    it('should handle toggle availability error', () => {
        mockShipperService.updateAvailability.and.returnValue(throwError(() => new Error('fail')));
        component.shipperId.set(1);

        component.toggleAvailability();

        expect(mockToastService.error).toHaveBeenCalledWith('Failed to update availability');
    });

    it('should logout and clear localStorage', () => {
        const removeSpy = spyOn(localStorage, 'removeItem');
        component.logout();
        expect(removeSpy).toHaveBeenCalledWith('shipperId');
        expect(removeSpy).toHaveBeenCalledWith('shipperName');
        expect(removeSpy).toHaveBeenCalledWith('shipperToken');
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/shipper-login']);
    });

    it('should format date correctly', () => {
        expect(component.formatDate('')).toBe('N/A');
        const formatted = component.formatDate('2025-01-15T10:30:00');
        expect(formatted).toBeTruthy();
        expect(formatted).not.toBe('N/A');
    });

    it('should format currency correctly', () => {
        const formatted = component.formatCurrency(1000);
        expect(formatted).toContain('1,000');
    });
});
