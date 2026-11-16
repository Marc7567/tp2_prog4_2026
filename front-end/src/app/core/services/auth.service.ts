import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment.js';
import { Usuario } from '../models/usuario.interface.js';

interface Sesion {
    access_token: string;
    usuario: Usuario;
}

@Injectable({
    providedIn: 'root',
})

export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);

    private url = environment.apiUrl;
    private key = 'access_token';
    private usuarioKey = 'usuario';

    private temporizadorModal?: ReturnType<typeof setTimeout>;
    private temporizadorExpiracion?: ReturnType<typeof setTimeout>;
    private temporizadorRedireccion?: ReturnType<typeof setTimeout>;

    private readonly tresMinutos = 3 * 60 * 1000;
    private readonly cincoMinutos = 5 * 60 * 1000;

    mostrarRenovacion = signal(false);
    mostrarExpiracion = signal(false);

    currentUser = signal<Usuario | null>(this.obtenerUsuarioGuardado());
    currentUserData = signal<Usuario | null>(this.obtenerUsuarioGuardado());

    accessToken(): string | null {
        return localStorage.getItem(this.key);
    }

    signIn(identificador: string, password: string) {
        const esEmail = identificador.includes('@');

        const credenciales = esEmail
            ? { email: identificador.trim(), password }
            : { username: identificador.trim(), password };

        return this.http.post<Sesion>(
            this.url + '/login', credenciales
        );
    }

    signUp(datos: FormData) {
        return this.http.post(this.url + '/usuarios/registro', datos);
    }

    iniciarSesion(token: string, usuario: Usuario) {
        localStorage.setItem(this.key, token);
        localStorage.setItem(this.usuarioKey, JSON.stringify(usuario));

        this.currentUser.set(usuario);
        this.currentUserData.set(usuario);

        this.iniciarTemporizador(token);

        return of(usuario);
    }

    restaurarSesion(): Observable<Usuario | null> {
        const token = this.accessToken();
        const usuario = this.obtenerUsuarioGuardado();

        if (!token || !usuario) {
            this.signOut();
            return of(null);
        }

        this.currentUser.set(usuario);
        this.currentUserData.set(usuario);
        this.iniciarTemporizador(token);

        return of(usuario);
    }

    renovarSesion(): Observable<{ access_token: string } | null> {
        const token = this.accessToken();

        if (!token) {
            this.signOut();
            void this.router.navigate(['/login']);
            return of(null);
        }
        return this.http
            .post<{ access_token: string }>(
                this.url + '/auth/refrescar',
                {}
            )
            .pipe(
                tap((respuesta) => {
                    localStorage.setItem(this.key, respuesta.access_token);
                    this.iniciarTemporizador(respuesta.access_token);
                })
            );
    }

    actualizarUsuario(usuario: Usuario): void {
        localStorage.setItem(this.usuarioKey, JSON.stringify(usuario));

        this.currentUser.set(usuario);
        this.currentUserData.set(usuario);
    }

    signOut(): void {
        this.limpiarTemporizadores();

        localStorage.removeItem(this.key);
        localStorage.removeItem(this.usuarioKey);

        this.currentUser.set(null);
        this.currentUserData.set(null);
        this.mostrarRenovacion.set(false);
        this.mostrarExpiracion.set(false);
    }

    private iniciarTemporizador(token: string): void {
        this.limpiarTemporizadores();
        this.mostrarRenovacion.set(false);

        const tiempoRestante = this.TiempoRestante(token);

        if (tiempoRestante <= 0) {
            this.expirarSesion();
            return;
        }

        const tiempoHastaModal = Math.max(0,
            tiempoRestante - this.tresMinutos
        );

        this.temporizadorModal = setTimeout(() => {
            this.mostrarRenovacion.set(true);
            }, tiempoHastaModal
        );

        this.temporizadorExpiracion = setTimeout(() => {
            this.expirarSesion();
        }, tiempoRestante);
    }

    private TiempoRestante(token: string): number {
        try {
            const parte = token.split('.')[1];

            if (!parte) {
                return this.cincoMinutos;
            }

            const payload = JSON.parse(
                atob(parte.replace(/-/g, '+').replace(/_/g, '/'))
            ) as { exp?: number };

            if (typeof payload.exp !== 'number') {
                return this.cincoMinutos;
            }

            return payload.exp * 1000 - Date.now();
        } catch {
            return this.cincoMinutos;
        }
    }

    private expirarSesion(): void {
        this.limpiarTemporizadores();

        localStorage.removeItem(this.key);
        localStorage.removeItem(this.usuarioKey);

        this.currentUser.set(null);
        this.currentUserData.set(null);
        this.mostrarRenovacion.set(false);
        this.mostrarExpiracion.set(true);

        this.temporizadorRedireccion = setTimeout(() => {
            this.mostrarExpiracion.set(false);
            void this.router.navigate(['/login']);
        }, 3000);
    }

    private limpiarTemporizadores(): void {
        if (this.temporizadorModal) {
            clearTimeout(this.temporizadorModal);
            this.temporizadorModal = undefined;
        }

        if (this.temporizadorExpiracion) {
            clearTimeout(this.temporizadorExpiracion);
            this.temporizadorExpiracion = undefined;
        }
        
        if (this.temporizadorRedireccion) {
            clearTimeout(this.temporizadorRedireccion);
            this.temporizadorRedireccion = undefined;
        }
    }

    private obtenerUsuarioGuardado(): Usuario | null {
        const usuario = localStorage.getItem(this.usuarioKey);

        if (!usuario) {
            return null;
        }

        try {
            return JSON.parse(usuario) as Usuario;
        } catch {
            localStorage.removeItem(this.usuarioKey);
            return null;
        }
    }
}
