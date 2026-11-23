import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard.js';
import { authAdminGuard } from './core/guards/auth-admin.guard.js';

export const routes: Routes = [
    {
        path: '', redirectTo: '/home', pathMatch: 'full'
    },
    {
        path: 'home',
        canActivate: [authGuard],
        loadComponent: () => import('./features/home/home').then(c => c.Home)
    },
    {
        path: 'publicacion/:id',
        canActivate: [authGuard],
        loadComponent: () => import('./features/publicacion-page/publicacion-page').then(c => c.PublicacionPage)
    },
    {
        path: 'perfil',
        canActivate: [authGuard],
        loadComponent: () => import('./features/perfil/perfil').then(c => c.Perfil)
    },
    {
        path: 'editar-perfil',
        canActivate: [authGuard],
        loadComponent: () => import('./features/editar-perfil/editar-perfil').then(c => c.EditarPerfil)
    },
    {
        path: 'dashboard/usuarios',
        canActivate: [authGuard, authAdminGuard],
        loadComponent: () => import('./features/dashboard/usuarios/usuarios').then(c => c.Usuarios)
    },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(c => c.Login)
    },
    {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register').then(c => c.Register)
    },
    {
        path: '**',
        redirectTo: '/home'
    }
];
