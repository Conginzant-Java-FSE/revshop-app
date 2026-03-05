import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';

describe('authGuard', () => {
    let authServiceSpy: any;
    let routerSpy: any;

    beforeEach(() => {
        authServiceSpy = {
            isLoggedIn: vi.fn(),
            userRole: vi.fn()
        };
        routerSpy = {
            createUrlTree: vi.fn().mockImplementation((path) => path)
        };

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authServiceSpy },
                { provide: Router, useValue: routerSpy }
            ]
        });
    });

    const runGuard = (routeData: any = {}, stateUrl: string = '/test') => {
        const route = { data: routeData } as ActivatedRouteSnapshot;
        const state = { url: stateUrl } as RouterStateSnapshot;
        return TestBed.runInInjectionContext(() => authGuard(route, state));
    };

    it('should allow access if user is logged in and no role is required', () => {
        authServiceSpy.isLoggedIn.mockReturnValue(true);
        const result = runGuard();
        expect(result).toBe(true);
    });

    it('should redirect to login if user is not logged in', () => {
        authServiceSpy.isLoggedIn.mockReturnValue(false);
        const result = runGuard({}, '/checkout');

        expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/login'], {
            queryParams: { returnUrl: '/checkout' }
        });
    });

    it('should allow access if user role matches expectedRole', () => {
        authServiceSpy.isLoggedIn.mockReturnValue(true);
        authServiceSpy.userRole.mockReturnValue('SELLER');

        const result = runGuard({ expectedRole: 'SELLER' });
        expect(result).toBe(true);
    });

    it('should redirect to home if user role does not match expectedRole', () => {
        authServiceSpy.isLoggedIn.mockReturnValue(true);
        authServiceSpy.userRole.mockReturnValue('BUYER');

        const result = runGuard({ expectedRole: 'SELLER' });
        expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/']);
    });
});
