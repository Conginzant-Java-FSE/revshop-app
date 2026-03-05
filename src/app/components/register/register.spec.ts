import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: any;
  let routerSpy: any;
  let locationSpy: any;

  beforeEach(async () => {
    authServiceSpy = {
      registerBuyer: vi.fn(),
      registerSeller: vi.fn()
    };
    routerSpy = {
      navigate: vi.fn(),
      createUrlTree: vi.fn().mockReturnValue({}),
      serializeUrl: vi.fn().mockReturnValue(''),
      events: of()
    };
    locationSpy = { back: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule, CommonModule],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } }, queryParams: of({}) } },
        { provide: Location, useValue: locationSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default BUYER role', () => {
    fixture.detectChanges();
    expect(component.registerForm).toBeDefined();
    expect(component.registerForm.get('role')?.value).toBe('BUYER');
  });

  it('should update seller validations when role changes to SELLER', () => {
    fixture.detectChanges();
    component.registerForm.get('role')?.setValue('SELLER');
    expect(component.isSeller).toBe(true);
    expect(component.registerForm.get('businessName')?.validator).toBeTruthy();
  });

  it('should clear seller validations when role changes back to BUYER', () => {
    fixture.detectChanges();
    component.registerForm.get('role')?.setValue('SELLER');
    component.registerForm.get('role')?.setValue('BUYER');
    expect(component.isSeller).toBe(false);
    expect(component.registerForm.get('businessName')?.validator).toBeNull();
  });

  it('should not submit if form is invalid', () => {
    fixture.detectChanges();
    component.onSubmit();
    expect(component.submitted).toBe(true);
    expect(authServiceSpy.registerBuyer).not.toHaveBeenCalled();
  });

  it('should call registerBuyer and navigate on successful submission', async () => {
    fixture.detectChanges();
    authServiceSpy.registerBuyer.mockReturnValue(of({}));

    component.registerForm.patchValue({
      role: 'BUYER',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
      phone: '1234567890',
      age: 25,
      securityQuestion: 'Pet name?',
      securityAnswer: 'Fluffy'
    });

    component.onSubmit();

    expect(authServiceSpy.registerBuyer).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should display error message on buyer registration failure', async () => {
    fixture.detectChanges();
    const errorResponse = { error: { message: 'Email already exists' } };
    authServiceSpy.registerBuyer.mockReturnValue(throwError(() => errorResponse));

    component.registerForm.patchValue({
      role: 'BUYER',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
      phone: '1234567890',
      age: 25,
      securityQuestion: 'Pet name?',
      securityAnswer: 'Fluffy'
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('Email already exists');
  });

  it('should call registerSeller and navigate on successful submission', async () => {
    fixture.detectChanges();
    authServiceSpy.registerSeller.mockReturnValue(of({}));

    component.registerForm.patchValue({
      role: 'SELLER',
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Password123!',
      phone: '0987654321',
      age: 30,
      securityQuestion: 'First car?',
      securityAnswer: 'Toyota',
      businessName: 'Jane Store',
      taxId: 'TAX123',
      businessDescription: 'Selling items'
    });

    component.onSubmit();

    expect(authServiceSpy.registerSeller).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should navigate back when goBack is called', () => {
    component.goBack();
    expect(locationSpy.back).toHaveBeenCalled();
  });
});
