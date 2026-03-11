import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShipperLoginComponent } from './shipper-login';
import { ShipperService } from '../../services/shipper.service';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { LocationService } from '../../services/location.service';
import { of, throwError } from 'rxjs';

describe('ShipperLoginComponent', () => {
    let component: ShipperLoginComponent;
    let fixture: ComponentFixture<ShipperLoginComponent>;
    let mockShipperService: jasmine.SpyObj<ShipperService>;
    let mockLocationService: jasmine.SpyObj<LocationService>;
    let mockRouter: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        mockShipperService = jasmine.createSpyObj('ShipperService', ['loginShipper']);
        mockLocationService = jasmine.createSpyObj('LocationService', ['clearLocation']);

        await TestBed.configureTestingModule({
            imports: [ShipperLoginComponent, ReactiveFormsModule, RouterTestingModule],
            providers: [
                { provide: ShipperService, useValue: mockShipperService },
                { provide: LocationService, useValue: mockLocationService }
            ]
        })
            .overrideComponent(ShipperLoginComponent, {
                remove: { imports: [] },
                add: { imports: [RouterTestingModule] }
            })
            .compileComponents();

        fixture = TestBed.createComponent(ShipperLoginComponent);
        component = fixture.componentInstance;
        spyOn(component['router'], 'navigate').and.stub();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a login form with email and password', () => {
        expect(component.loginForm.contains('email')).toBeTrue();
        expect(component.loginForm.contains('password')).toBeTrue();
    });

    it('should mark email as invalid when empty', () => {
        component.loginForm.controls['email'].setValue('');
        expect(component.loginForm.controls['email'].valid).toBeFalse();
    });

    it('should mark email as invalid for bad format', () => {
        component.loginForm.controls['email'].setValue('not-an-email');
        expect(component.loginForm.controls['email'].valid).toBeFalse();
    });

    it('should mark email as valid for correct format', () => {
        component.loginForm.controls['email'].setValue('test@example.com');
        expect(component.loginForm.controls['email'].valid).toBeTrue();
    });

    it('should mark password as invalid when less than 6 characters', () => {
        component.loginForm.controls['password'].setValue('12345');
        expect(component.loginForm.controls['password'].valid).toBeFalse();
    });

    it('should mark password as valid for 6+ characters', () => {
        component.loginForm.controls['password'].setValue('123456');
        expect(component.loginForm.controls['password'].valid).toBeTrue();
    });

    it('should toggle password visibility', () => {
        expect(component.showPassword).toBeFalse();
        component.togglePassword();
        expect(component.showPassword).toBeTrue();
        component.togglePassword();
        expect(component.showPassword).toBeFalse();
    });

    it('should not submit when form is invalid', () => {
        component.onSubmit();
        expect(mockShipperService.loginShipper).not.toHaveBeenCalled();
    });

    it('should login and store data on success', () => {
        const setItemSpy = spyOn(localStorage, 'setItem');
        mockShipperService.loginShipper.and.returnValue(of({
            message: 'OK',
            data: { token: 'abc', shipperId: 1, name: 'Shipper', email: 'test@test.com', vehicleNumber: 'KA-01' }
        }));

        component.loginForm.controls['email'].setValue('test@test.com');
        component.loginForm.controls['password'].setValue('password123');
        component.onSubmit();

        expect(mockShipperService.loginShipper).toHaveBeenCalledWith('test@test.com', 'password123');
        expect(setItemSpy).toHaveBeenCalledWith('shipperToken', 'abc');
        expect(setItemSpy).toHaveBeenCalledWith('shipperId', '1');
        expect(setItemSpy).toHaveBeenCalledWith('shipperName', 'Shipper');
        expect(setItemSpy).toHaveBeenCalledWith('role', 'SHIPPER');
        expect(mockLocationService.clearLocation).toHaveBeenCalled();
        expect(component['router'].navigate).toHaveBeenCalledWith(['/shipper-dashboard']);
        expect(component.loading).toBeFalse();
    });

    it('should show error message on login failure', () => {
        mockShipperService.loginShipper.and.returnValue(throwError(() => ({
            error: { message: 'Invalid credentials' }
        })));

        component.loginForm.controls['email'].setValue('test@test.com');
        component.loginForm.controls['password'].setValue('wrongpass');
        component.onSubmit();

        expect(component.errorMessage).toBe('Invalid credentials');
        expect(component.loading).toBeFalse();
    });

    it('should show default error message when no message in error response', () => {
        mockShipperService.loginShipper.and.returnValue(throwError(() => ({
            error: {}
        })));

        component.loginForm.controls['email'].setValue('test@test.com');
        component.loginForm.controls['password'].setValue('wrongpass');
        component.onSubmit();

        expect(component.errorMessage).toBe('Invalid credentials. Please try again.');
    });
});
