import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { of } from 'rxjs';

describe('authInterceptor', () => {

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({});
    });

    afterEach(() => {
        localStorage.clear();
    });

    const intercept = (req: HttpRequest<any>, next: HttpHandlerFn) => {
        return TestBed.runInInjectionContext(() => authInterceptor(req, next));
    };

    it('should add Authorization header if token exists', () => {
        localStorage.setItem('token', 'test-token');
        const request = new HttpRequest('GET', '/api/test');

        const next: HttpHandlerFn = (req) => {
            expect(req.headers.get('Authorization')).toBe('Bearer test-token');
            return of({} as HttpEvent<any>);
        };

        intercept(request, next).subscribe();
    });

    it('should add Authorization header if shipperToken exists', () => {
        localStorage.setItem('shipperToken', 'shipper-token');
        const request = new HttpRequest('GET', '/api/test');

        const next: HttpHandlerFn = (req) => {
            expect(req.headers.get('Authorization')).toBe('Bearer shipper-token');
            return of({} as HttpEvent<any>);
        };

        intercept(request, next).subscribe();
    });

    it('should not add Authorization header if no token exists', () => {
        const request = new HttpRequest('GET', '/api/test');

        const next: HttpHandlerFn = (req) => {
            expect(req.headers.has('Authorization')).toBe(false);
            return of({} as HttpEvent<any>);
        };

        intercept(request, next).subscribe();
    });
});
