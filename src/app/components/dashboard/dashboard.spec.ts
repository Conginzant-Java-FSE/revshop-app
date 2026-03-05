import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order';
import { ProductService } from '../../services/product';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockAuthService: jasmine.SpyObj<any>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout'], {
      userRole: jasmine.createSpy('userRole').and.returnValue('BUYER')
    });
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: OrderService, useValue: {} },
        { provide: ProductService, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to buyer-dashboard when role is BUYER', () => {
    mockAuthService.userRole.and.returnValue('BUYER');
    component.ngOnInit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/buyer-dashboard']);
  });

  it('should navigate to seller-dashboard when role is SELLER', () => {
    mockAuthService.userRole.and.returnValue('SELLER');
    component.ngOnInit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/seller-dashboard']);
  });

  it('should navigate to login when no role is set', () => {
    mockAuthService.userRole.and.returnValue(null);
    component.ngOnInit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should call logout and navigate to login on onLogout', () => {
    component.onLogout();
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});
