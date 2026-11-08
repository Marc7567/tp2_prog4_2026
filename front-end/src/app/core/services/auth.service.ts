import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario } from '../models/usuario.interface';

interface Sesion {
    access_token: string;
    usuario: Usuario;
}

@Injectable({ 
    providedIn: 'root' 
})

export class AuthService {
    private http = inject(HttpClient);
    private url = environment.apiUrl;
    private key = 'access_token';
    private usuarioKey = 'usuario';

    currentUser = signal<Usuario | null>(
        this.obtenerUsuarioGuardado()
    );

    currentUserData = signal<Usuario | null>(
        this.obtenerUsuarioGuardado()
    );

    accessToken(): string | null {
        return localStorage.getItem(this.key);
    }

    signIn(identificador: string, password: string) {
        const esEmail = identificador.includes('@');

        const credenciales = esEmail
            ? { email: identificador.trim(), password }
            : { username: identificador.trim(), password };

        return this.http.post<Sesion>(this.url + '/login', credenciales);
    }

    signUp(datos: FormData) {
        return this.http.post(this.url + '/usuarios/registro', datos);
    }

    iniciarSesion(token: string, usuario: Usuario) {
        localStorage.setItem(this.key, token);
        localStorage.setItem(
            this.usuarioKey,
            JSON.stringify(usuario)
        );

        this.currentUser.set(usuario);
        this.currentUserData.set(usuario);

        return of(usuario);
    }

    restaurarSesion() {
        const token = this.accessToken();
        const usuario = this.obtenerUsuarioGuardado();

        if (!token || !usuario) {
            this.signOut();
            return of(null);
        }

        this.currentUser.set(usuario);
        this.currentUserData.set(usuario);

        return of(usuario);
    }

    // Actualizar los datos del Usuario
    actualizarUsuario(usuario: Usuario): void {
        localStorage.setItem(
            this.usuarioKey,
            JSON.stringify(usuario)
        );

        this.currentUser.set(usuario);
        this.currentUserData.set(usuario);
    }

    signOut(): void {
        localStorage.removeItem(this.key);
        localStorage.removeItem(this.usuarioKey);

        this.currentUser.set(null);
        this.currentUserData.set(null);
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