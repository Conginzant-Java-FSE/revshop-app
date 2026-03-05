import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingPageComponent } from './landing-page';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';
import { of } from 'rxjs';

describe('LandingPageComponent', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;

  const mockCartService = {
    addItemToCart: jasmine.createSpy('addItemToCart').and.returnValue(of({ message: 'ok', data: {} }))
  };
  const mockAuthService = {
    isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(false),
    getUser: jasmine.createSpy('getUser').and.returnValue(null)
  };
  const mockToastService = {
    success: jasmine.createSpy('success'),
    error: jasmine.createSpy('error')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: CartService, useValue: mockCartService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastService, useValue: mockToastService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the landing page component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the promotional banner section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const banner = compiled.querySelector('app-promotional-banner');
    expect(banner).toBeTruthy();
  });

  it('should render the featured categories section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const categories = compiled.querySelector('app-featured-categories');
    expect(categories).toBeTruthy();
  });

  it('should render the featured products section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const products = compiled.querySelector('app-featured-products');
    expect(products).toBeTruthy();
  });

  it('should render the header component', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const header = compiled.querySelector('app-header');
    expect(header).toBeTruthy();
  });

  it('should render the footer component', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const footer = compiled.querySelector('app-footer');
    expect(footer).toBeTruthy();
  });
});
