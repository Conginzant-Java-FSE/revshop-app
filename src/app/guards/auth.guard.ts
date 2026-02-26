import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);

    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token) {
        // If there is no token, user is not logged in.
        // Redirect to login page and optionally pass the intended URL
        return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }

    // Check if the route specifies an expected role
    const expectedRole = route.data['expectedRole'];

    // If a specific role is required and user does not have it
    if (expectedRole && userRole !== expectedRole) {
        // Redirect to a safe page or unauthorized page
        return router.createUrlTree(['/']);
    }

    // User is logged in and role matches (or no role required)
    return true;
};
