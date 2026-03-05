import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: any;
  let routerSpy: any;
  let locationSpy: any;

  beforeEach(async () => {
    authServiceSpy = {
      loginBuyer: vi.fn(),
      loginSeller: vi.fn(),
      saveAuthData: vi.fn()
    };
    routerSpy = {
      navigate: vi.fn(),
      createUrlTree: vi.fn().mockReturnValue({}),
      serializeUrl: vi.fn().mockReturnValue(''),
      events: of()
    };
    locationSpy = { back: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, CommonModule],
      providers: [
        FormBuilder,
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } }, queryParams: of({}) } },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Location, useValue: locationSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    fixture.detectChanges();
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get('role')?.value).toBe('BUYER');
  });

  it('should mark form as invalid when empty', () => {
    fixture.detectChanges();
    expect(component.loginForm.valid).toBe(false);
  });

  it('should validate email format', () => {
    fixture.detectChanges();
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBe(false);
    emailControl?.setValue('test@example.com');
    expect(emailControl?.valid).toBe(true);
  });

  it('should not submit if form is invalid', () => {
    fixture.detectChanges();
    component.onSubmit();
    expect(component.submitted).toBe(true);
    expect(authServiceSpy.loginBuyer).not.toHaveBeenCalled();
  });

  it('should call loginBuyer and navigate on successful buyer login', async () => {
    fixture.detectChanges();
    const mockResponse = { data: { token: 'token123', role: 'BUYER', userId: 1, name: 'John Doe' } };
    authServiceSpy.loginBuyer.mockReturnValue(of(mockResponse));

    component.loginForm.patchValue({
      role: 'BUYER',
      email: 'buyer@example.com',
      password: 'password123'
    });

    component.onSubmit();

    expect(authServiceSpy.loginBuyer).toHaveBeenCalled();
    expect(authServiceSpy.saveAuthData).toHaveBeenCalledWith('token123', 'BUYER', 1, 'John Doe');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should set error message on buyer login failure', async () => {
    fixture.detectChanges();
    const errorResponse = { error: { message: 'Invalid credentials' } };
    authServiceSpy.loginBuyer.mockReturnValue(throwError(() => errorResponse));

    component.loginForm.patchValue({
      role: 'BUYER',
      email: 'buyer@example.com',
      password: 'wrongpass'
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('Invalid credentials');
  });

  it('should call loginSeller and navigate on successful seller login', async () => {
    fixture.detectChanges();
    const mockResponse = { data: { token: 'token456', role: 'SELLER', userId: 2, name: 'Seller Store' } };
    authServiceSpy.loginSeller.mockReturnValue(of(mockResponse));

    component.loginForm.patchValue({
      role: 'SELLER',
      email: 'seller@example.com',
      password: 'password123'
    });

    component.onSubmit();

    expect(authServiceSpy.loginSeller).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should set error message on seller login failure', async () => {
    fixture.detectChanges();
    // Return an error object that matches the component's expectation for .error.message
    const errorResponse = { error: { message: 'Login Failed API Error' } };
    authServiceSpy.loginSeller.mockReturnValue(throwError(() => errorResponse));

    component.loginForm.patchValue({
      role: 'SELLER',
      email: 'seller@example.com',
      password: 'wrongpass'
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('Login Failed API Error');
  });

  it('should navigate back when goBack is called', () => {
    component.goBack();
    expect(locationSpy.back).toHaveBeenCalled();
  });
});
