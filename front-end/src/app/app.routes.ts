import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

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
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(c => c.Login)
    },
    {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register').then(c => c.Register)
    },
    {
        path: 'perfil',
        canActivate: [authGuard],
        loadComponent: () => import('./features/perfil/perfil').then(c => c.Perfil)
    },
    {
        path: '**',
        redirectTo: '/home'
    }
];
