import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { CartComponent } from './cart';
import { CartService } from '../../services/cart';

describe('CartComponent', () => {
    let component: CartComponent;
    let fixture: ComponentFixture<CartComponent>;
    let cartService: jasmine.SpyObj<CartService>;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('CartService', ['getCartByUserId', 'updateItemQuantity', 'removeItemFromCart', 'clearCart']);

        await TestBed.configureTestingModule({
            imports: [CartComponent, HttpClientTestingModule, RouterTestingModule],
            providers: [
                { provide: CartService, useValue: spy }
            ]
        }).compileComponents();

        cartService = TestBed.inject(CartService) as jasmine.SpyObj<CartService>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CartComponent);
        component = fixture.componentInstance;
        cartService.getCartByUserId.and.returnValue(of({ message: 'Success', data: { cartId: 1, items: [], totalPrice: 0 } }));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load cart on init', () => {
        localStorage.setItem('userId', '1');
        component.ngOnInit();
        expect(cartService.getCartByUserId).toHaveBeenCalledWith(1);
    });
});
