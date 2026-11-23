import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service.js';

export const authAdminGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const comprobarRol = (rol: string | undefined) => {
        if (rol === 'administrador') {
            return true;
        }

        if (!rol) {
            return router.createUrlTree(['/login']);
        }

        return router.createUrlTree(['/home']);
    };

    const usuario = authService.currentUser();

    if (usuario) {
        return comprobarRol(usuario.rol);
    }

    if (!authService.accessToken()) {
        return router.createUrlTree(['/login']);
    }

    return authService.restaurarSesion().pipe(
        map((usuarioRestaurado) =>
            comprobarRol(usuarioRestaurado?.rol)
        )
    );
}
