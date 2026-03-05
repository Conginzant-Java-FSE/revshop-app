import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn, HttpErrorResponse, HttpEvent, HttpResponse } from '@angular/common/http';
import { errorInterceptor } from './error.interceptor';
import { ToastService } from './toast';
import { AuthService } from './auth';
import { Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';

describe('errorInterceptor', () => {
    let toastServiceSpy: any;
    let authServiceSpy: any;
    let routerSpy: any;

    beforeEach(() => {
        toastServiceSpy = { error: vi.fn() };
        authServiceSpy = { logout: vi.fn() };
        routerSpy = { navigate: vi.fn() };

        TestBed.configureTestingModule({
            providers: [
                { provide: ToastService, useValue: toastServiceSpy },
                { provide: AuthService, useValue: authServiceSpy },
                { provide: Router, useValue: routerSpy }
            ]
        });
    });

    const intercept = (error: HttpErrorResponse) => {
        const req = new HttpRequest('GET', '/test');
        const next: HttpHandlerFn = () => throwError(() => error);
        return TestBed.runInInjectionContext(() => errorInterceptor(req, next));
    };

    it('should handle 401 error - logout and redirect', () => {
        const errorResponse = new HttpErrorResponse({ status: 401 });

        intercept(errorResponse).subscribe({
            error: (err) => {
                expect(authServiceSpy.logout).toHaveBeenCalled();
                expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
                expect(toastServiceSpy.error).toHaveBeenCalledWith('Session expired. Please login again.');
                expect(err).toBe(errorResponse);
            }
        });
    });

    it('should handle generic error with message from body', () => {
        const errorResponse = new HttpErrorResponse({
            status: 400,
            error: { message: 'Bad request' }
        });

        intercept(errorResponse).subscribe({
            error: () => {
                expect(toastServiceSpy.error).toHaveBeenCalledWith('Bad request');
            }
        });
    });

    it('should handle client-side error', () => {
        const errorResponse = new HttpErrorResponse({
            error: new ErrorEvent('ClientError', { message: 'Network issue' })
        });

        intercept(errorResponse).subscribe({
            error: () => {
                expect(toastServiceSpy.error).toHaveBeenCalledWith('Error: Network issue');
            }
        });
    });
});
