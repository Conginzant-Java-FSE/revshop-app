import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ForgotPasswordComponent', () => {
    let component: ForgotPasswordComponent;
    let fixture: ComponentFixture<ForgotPasswordComponent>;
    let authServiceSpy: any;
    let toastServiceSpy: any;
    let router: Router;

    beforeEach(async () => {
        authServiceSpy = {
            getSecurityQuestion: jasmine.createSpy('getSecurityQuestion'),
            resetPassword: jasmine.createSpy('resetPassword')
        };
        toastServiceSpy = {
            success: jasmine.createSpy('success'),
            error: jasmine.createSpy('error')
        };

        await TestBed.configureTestingModule({
            imports: [ForgotPasswordComponent, ReactiveFormsModule, CommonModule],
            providers: [
                FormBuilder,
                provideRouter([]),
                { provide: AuthService, useValue: authServiceSpy },
                { provide: ToastService, useValue: toastServiceSpy }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(ForgotPasswordComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        spyOn(router, 'navigate');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize forms with default values', () => {
        expect(component.emailForm).toBeDefined();
        expect(component.resetForm).toBeDefined();
        expect(component.emailForm.get('email')?.value).toBe('');
        expect(component.step()).toBe(1);
    });

    it('password match validator should return mismatch when passwords differ', () => {
        component.resetForm.patchValue({
            newPassword: 'Password123!',
            confirmPassword: 'Password456!'
        });
        expect(component.resetForm.errors).toEqual({ mismatch: true });
    });

    it('password match validator should return null when passwords match', () => {
        component.resetForm.patchValue({
            newPassword: 'Password123!',
            confirmPassword: 'Password123!'
        });
        expect(component.resetForm.errors).toBeNull();
    });

    it('fetchQuestion should not proceed if email is invalid', () => {
        component.emailForm.patchValue({ email: 'invalid-email' });
        component.fetchQuestion();
        expect(component.submitted()).toBe(true);
        expect(authServiceSpy.getSecurityQuestion).not.toHaveBeenCalled();
    });

    it('fetchQuestion should fetch security question and proceed to step 2 on success', async () => {
        const question = 'What is your pet name?';
        authServiceSpy.getSecurityQuestion.and.returnValue(of({ data: question }));

        component.emailForm.patchValue({ email: 'test@example.com' });
        component.fetchQuestion();
        await fixture.whenStable();

        expect(authServiceSpy.getSecurityQuestion).toHaveBeenCalledWith('test@example.com');
        expect(component.securityQuestion()).toBe(question);
        expect(component.step()).toBe(2);
        expect(component.loading()).toBe(false);
    });

    it('fetchQuestion should show error toast on failure', async () => {
        authServiceSpy.getSecurityQuestion.and.returnValue(throwError(() => ({ error: { message: 'User not found' } })));

        component.emailForm.patchValue({ email: 'unknown@example.com' });
        component.fetchQuestion();
        await fixture.whenStable();

        expect(toastServiceSpy.error).toHaveBeenCalledWith('User not found');
        expect(component.step()).toBe(1);
    });

    it('resetPassword should not proceed if reset form is invalid', () => {
        component.resetPassword();
        expect(authServiceSpy.resetPassword).not.toHaveBeenCalled();
    });

    it('resetPassword should call reset API and navigate to login on success', async () => {
        authServiceSpy.resetPassword.and.returnValue(of({}));

        component.emailForm.patchValue({ email: 'test@example.com' });
        component.resetForm.patchValue({
            securityAnswer: 'Fluffy',
            newPassword: 'Password123!',
            confirmPassword: 'Password123!'
        });

        component.resetPassword();
        await fixture.whenStable();

        expect(authServiceSpy.resetPassword).toHaveBeenCalledWith({
            email: 'test@example.com',
            securityAnswer: 'Fluffy',
            newPassword: 'Password123!'
        });
        expect(toastServiceSpy.success).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('resetPassword should show error toast on failure', async () => {
        authServiceSpy.resetPassword.and.returnValue(throwError(() => ({ error: { message: 'Incorrect security answer' } })));

        component.emailForm.patchValue({ email: 'test@example.com' });
        component.resetForm.patchValue({
            securityAnswer: 'Wrong',
            newPassword: 'Password123!',
            confirmPassword: 'Password123!'
        });

        component.resetPassword();
        await fixture.whenStable();

        expect(toastServiceSpy.error).toHaveBeenCalledWith('Incorrect security answer');
    });
});
