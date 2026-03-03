import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastService } from './toast';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from './auth';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const toastService = inject(ToastService);
    const authService = inject(AuthService);
    const router = inject(Router);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage = 'An unexpected error occurred';

            if (error.status === 401) {
                authService.logout();
                router.navigate(['/login']);
                errorMessage = 'Session expired. Please login again.';
            } else if (error.error instanceof ErrorEvent) {
                errorMessage = `Error: ${error.error.message}`;
            } else {
                errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
            }

            toastService.error(errorMessage);
            return throwError(() => error);
        })
    );
};
