import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShipperRegisterComponent } from './shipper-register';
import { ShipperService } from '../../services/shipper.service';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('ShipperRegisterComponent', () => {
    let component: ShipperRegisterComponent;
    let fixture: ComponentFixture<ShipperRegisterComponent>;
    let mockShipperService: jasmine.SpyObj<ShipperService>;
    let mockRouter: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        mockShipperService = jasmine.createSpyObj('ShipperService', ['registerShipper']);

        await TestBed.configureTestingModule({
            imports: [ShipperRegisterComponent, ReactiveFormsModule, RouterTestingModule],
            providers: [
                { provide: ShipperService, useValue: mockShipperService }
            ]
        })
            .overrideComponent(ShipperRegisterComponent, {
                remove: { imports: [] },
                add: { imports: [RouterTestingModule] }
            })
            .compileComponents();

        fixture = TestBed.createComponent(ShipperRegisterComponent);
        component = fixture.componentInstance;
        spyOn(component['router'], 'navigate').and.stub();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a form with all required fields', () => {
        expect(component.form.contains('name')).toBeTrue();
        expect(component.form.contains('email')).toBeTrue();
        expect(component.form.contains('phone')).toBeTrue();
        expect(component.form.contains('vehicleNumber')).toBeTrue();
        expect(component.form.contains('password')).toBeTrue();
        expect(component.form.contains('confirmPassword')).toBeTrue();
    });

    it('should mark name as invalid when less than 3 characters', () => {
        component.form.controls['name'].setValue('AB');
        expect(component.form.controls['name'].valid).toBeFalse();
    });

    it('should mark name as valid for 3+ characters', () => {
        component.form.controls['name'].setValue('ABC');
        expect(component.form.controls['name'].valid).toBeTrue();
    });

    it('should mark email as invalid for bad format', () => {
        component.form.controls['email'].setValue('invalid');
        expect(component.form.controls['email'].valid).toBeFalse();
    });

    it('should mark phone as invalid for non-10-digit input', () => {
        component.form.controls['phone'].setValue('12345');
        expect(component.form.controls['phone'].valid).toBeFalse();
    });

    it('should mark phone as valid for 10 digits', () => {
        component.form.controls['phone'].setValue('1234567890');
        expect(component.form.controls['phone'].valid).toBeTrue();
    });

    it('should detect password mismatch', () => {
        component.form.controls['password'].setValue('password123');
        component.form.controls['confirmPassword'].setValue('different');
        expect(component.form.hasError('passwordMismatch')).toBeTrue();
    });

    it('should pass when passwords match', () => {
        component.form.controls['password'].setValue('password123');
        component.form.controls['confirmPassword'].setValue('password123');
        expect(component.form.hasError('passwordMismatch')).toBeFalse();
    });

    it('should expose form controls via getter f', () => {
        expect(component.f['name']).toBeDefined();
        expect(component.f['email']).toBeDefined();
    });

    it('should not submit when form is invalid', () => {
        component.onSubmit();
        expect(mockShipperService.registerShipper).not.toHaveBeenCalled();
    });

    it('should register and store data on success', () => {
        const setItemSpy = spyOn(localStorage, 'setItem');
        mockShipperService.registerShipper.and.returnValue(of({
            message: 'OK',
            data: { shipperId: 1, name: 'Test', email: 'test@test.com', vehicleNumber: 'KA-01', token: 'abc' }
        }));

        component.form.controls['name'].setValue('Test Shipper');
        component.form.controls['email'].setValue('test@test.com');
        component.form.controls['phone'].setValue('1234567890');
        component.form.controls['vehicleNumber'].setValue('KA-01-1234');
        component.form.controls['password'].setValue('password123');
        component.form.controls['confirmPassword'].setValue('password123');

        component.onSubmit();

        expect(mockShipperService.registerShipper).toHaveBeenCalled();
        expect(setItemSpy).toHaveBeenCalledWith('shipperId', '1');
        expect(setItemSpy).toHaveBeenCalledWith('role', 'SHIPPER');
        expect(component['router'].navigate).toHaveBeenCalledWith(['/shipper-dashboard']);
        expect(component.loading).toBeFalse();
    });

    it('should show error on registration failure', () => {
        mockShipperService.registerShipper.and.returnValue(throwError(() => ({
            error: { message: 'Email already exists' }
        })));

        component.form.controls['name'].setValue('Test Shipper');
        component.form.controls['email'].setValue('test@test.com');
        component.form.controls['phone'].setValue('1234567890');
        component.form.controls['vehicleNumber'].setValue('KA-01-1234');
        component.form.controls['password'].setValue('password123');
        component.form.controls['confirmPassword'].setValue('password123');

        component.onSubmit();

        expect(component.errorMessage).toBe('Email already exists');
        expect(component.loading).toBeFalse();
    });

    it('should show default error message when no message in error', () => {
        mockShipperService.registerShipper.and.returnValue(throwError(() => ({
            error: {}
        })));

        component.form.controls['name'].setValue('Test Shipper');
        component.form.controls['email'].setValue('test@test.com');
        component.form.controls['phone'].setValue('1234567890');
        component.form.controls['vehicleNumber'].setValue('KA-01-1234');
        component.form.controls['password'].setValue('password123');
        component.form.controls['confirmPassword'].setValue('password123');

        component.onSubmit();

        expect(component.errorMessage).toBe('Registration failed. Please try again.');
    });
});
