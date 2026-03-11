import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { CheckoutComponent } from './checkout';
import { AddressService } from '../../services/address';
import { CartService } from '../../services/cart';
import { CouponService } from '../../services/coupon.service';
import { PaymentService } from '../../services/payment.service';
import { OrderService } from '../../services/order';
import { ToastService } from '../../services/toast';

describe('CheckoutComponent', () => {
    let component: CheckoutComponent;
    let fixture: ComponentFixture<CheckoutComponent>;
    let addressService: jasmine.SpyObj<AddressService>;
    let cartService: jasmine.SpyObj<CartService>;

    beforeEach(async () => {
        const addrSpy = jasmine.createSpyObj('AddressService', ['getAddressesByUser', 'addAddress']);
        const cartSpy = jasmine.createSpyObj('CartService', ['getCartByUserId']);
        const couponSpy = jasmine.createSpyObj('CouponService', ['validateCoupon', 'getActiveCoupons']);
        couponSpy.getActiveCoupons.and.returnValue(of({ message: 'Success', data: [] }));
        const paySpy = jasmine.createSpyObj('PaymentService', ['createRazorpayOrder', 'verifyPayment']);
        const orderSpy = jasmine.createSpyObj('OrderService', ['placeOrder', 'cancelOrder']);
        const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

        await TestBed.configureTestingModule({
            imports: [CheckoutComponent, HttpClientTestingModule, RouterTestingModule, FormsModule],
            providers: [
                { provide: AddressService, useValue: addrSpy },
                { provide: CartService, useValue: cartSpy },
                { provide: CouponService, useValue: couponSpy },
                { provide: PaymentService, useValue: paySpy },
                { provide: OrderService, useValue: orderSpy },
                { provide: ToastService, useValue: toastSpy }
            ]
        }).compileComponents();

        addressService = TestBed.inject(AddressService) as jasmine.SpyObj<AddressService>;
        cartService = TestBed.inject(CartService) as jasmine.SpyObj<CartService>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CheckoutComponent);
        component = fixture.componentInstance;
        addressService.getAddressesByUser.and.returnValue(of([]));
        cartService.getCartByUserId.and.returnValue(of({ message: 'Success', data: { cartId: 1, items: [], totalPrice: 0 } }));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should calculate subtotal correctly', () => {
        component.cart.set({
            cartId: 1,
            totalPrice: 200,
            items: [
                { productId: 1, productName: 'P1', sellingPrice: 100, quantity: 2 }
            ]
        });
        expect(component.subtotal).toBe(200);
    });
});
