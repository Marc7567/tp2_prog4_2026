import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service.js';

export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.currentUser()) {
        return true;
    }

    if (!authService.accessToken()) {
        return router.createUrlTree(['/login']);
    }

    return authService.restaurarSesion().pipe(
        map((usuario) =>
            usuario ? true : router.createUrlTree(['/login'])
        )
    );
}