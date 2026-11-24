import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, of, shareReplay, tap, timer } from 'rxjs';
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
    private restauracionEnCurso?: Observable<Usuario | null>;

    private temporizadorModal?: ReturnType<typeof setTimeout>;
    private temporizadorExpiracion?: ReturnType<typeof setTimeout>;
    private temporizadorRedireccion?: ReturnType<typeof setTimeout>;

    private readonly unMinuto = 60 * 1000;

    mostrarRenovacion = signal(false);
    mostrarExpiracion = signal(false);

    cargandoInicio = signal(true);

    currentUser = signal<Usuario | null>(null);
    currentUserData = signal<Usuario | null>(null);

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

    // Registra un usuario.
    signUp(datos: FormData): Observable<{
        access_token: string;
        usuario: Omit<Usuario, 'id'> & {
            _id: string;
            id?: string;
        };
    }> {
        // Enviamos los datos del formulario al endpoint de registro.
        // El backend devuelve el token JWT y los datos del usuario creado.
        return this.http.post<{
            access_token: string;
            usuario: Omit<Usuario, 'id'> & {
                _id: string;
                id?: string;
            };
        }>(this.url + '/usuarios/registro', datos);
    }

    iniciarSesion(token: string, usuario: Usuario) {
        localStorage.setItem(this.key, token);

        this.currentUser.set(usuario);
        this.currentUserData.set(usuario);

        this.iniciarTemporizador(token);

        return of(usuario);
    }

    restaurarSesion(): Observable<Usuario | null> {
        const usuarioActual = this.currentUser();

        if (usuarioActual) {
            this.cargandoInicio.set(false);
            return of(usuarioActual);
        }

        const token = this.accessToken();

        if (!token) {
            this.signOut();
            this.cargandoInicio.set(false);
            return of(null);
        }

        if (this.restauracionEnCurso) {
            return this.restauracionEnCurso;
        }

        this.cargandoInicio.set(true);

        this.restauracionEnCurso = this.http
            .post<{ autorizado: boolean; usuario: Usuario }>(
                this.url + '/auth/autorizar',
                {}
            )
            .pipe(
                map((respuesta) => {
                    if (!respuesta.autorizado || !respuesta.usuario) {
                        this.signOut();
                        return null;
                    }

                    this.currentUser.set(respuesta.usuario);
                    this.currentUserData.set(respuesta.usuario);
                    this.iniciarTemporizador(token);

                    return respuesta.usuario;
                }),
                catchError(() => {
                    this.signOut();
                    return of(null);
                }),
                finalize(() => {
                    this.cargandoInicio.set(false);
                    this.restauracionEnCurso = undefined;
                }),
                shareReplay(1)
            );

        return this.restauracionEnCurso;
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
        this.currentUser.set(usuario);
        this.currentUserData.set(usuario);
    }
    
    signOut(): void {
        this.limpiarTemporizadores();

        localStorage.removeItem(this.key);

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

        // Mostrar el modal cuando falte un minuto.
        const tiempoHastaModal = Math.max(
            0,
            tiempoRestante - this.unMinuto
        );

        this.temporizadorModal = setTimeout(() => {
            this.mostrarRenovacion.set(true);
        }, tiempoHastaModal);

        // Expirar la sesion cuando venza el JWT.
        this.temporizadorExpiracion = setTimeout(() => {
            this.expirarSesion();
        }, tiempoRestante);
    }

    private TiempoRestante(token: string): number {
        try {
            const parte = token.split('.')[1];

            if (!parte) {
                return 0;
            }

            const payload = JSON.parse(
                atob(parte.replace(/-/g, '+').replace(/_/g, '/'))
            ) as { exp?: number };

            if (typeof payload.exp !== 'number') {
                return 0;
            }

            return payload.exp * 1000 - Date.now();
        } catch {
            return 0;
        }
    }

    private expirarSesion(): void {
        this.limpiarTemporizadores();

        // eliminamos del localStorage el token
        localStorage.removeItem(this.key);

        // 
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
}
