import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FeaturedProducts } from './featured-products';
import { provideRouter } from '@angular/router';
import { CartService } from '../../../services/cart';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';
import { of } from 'rxjs';
import { signal, computed } from '@angular/core';

describe('FeaturedProducts', () => {
    let component: FeaturedProducts;
    let fixture: ComponentFixture<FeaturedProducts>;
    let mockCartService: jasmine.SpyObj<CartService>;
    let mockToastService: jasmine.SpyObj<ToastService>;

    beforeEach(async () => {
        mockCartService = jasmine.createSpyObj('CartService', ['addItemToCart']);
        mockCartService.addItemToCart.and.returnValue(of({ message: 'ok', data: {} }));

        mockToastService = jasmine.createSpyObj('ToastService', ['success', 'error']);

        // Mock AuthService using minimal shape expected
        const mockAuthService = {
            authState: signal({ token: null, role: null, userId: null, name: null }),
            isLoggedIn: computed(() => false),
            userRole: computed(() => null)
        };

        await TestBed.configureTestingModule({
            imports: [FeaturedProducts],
            providers: [
                provideRouter([{ path: 'login', children: [] }]),
                { provide: CartService, useValue: mockCartService },
                { provide: AuthService, useValue: mockAuthService },
                { provide: ToastService, useValue: mockToastService },
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(FeaturedProducts);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the featured products component', () => {
        expect(component).toBeTruthy();
    });

    it('should have successMessage initialized as empty string', () => {
        expect(component.successMessage).toBe('');
    });

    it('should render the featured products template', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.innerHTML).toBeTruthy();
    });

    it('should call toastService and router.navigate when addToCart is called without userId', () => {
        spyOn(localStorage, 'getItem').and.returnValue(null);
        component.addToCart(1);
        expect(mockToastService.success).toHaveBeenCalledWith('Please login to add items to cart');
    });

    it('should call cartService.addItemToCart when user is logged in and addToCart is called', fakeAsync(() => {
        spyOn(localStorage, 'getItem').and.returnValue('42');
        component.addToCart(5);
        tick();
        expect(mockCartService.addItemToCart).toHaveBeenCalledWith(42, 5, 1);
    }));

    it('should show success toast after adding to cart successfully', fakeAsync(() => {
        spyOn(localStorage, 'getItem').and.returnValue('42');
        component.addToCart(5);
        tick();
        expect(mockToastService.success).toHaveBeenCalledWith('Item added to cart!');
    }));
});
