import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.js';
import type { CrearUsuarioAdmin, UsuarioAdmin } from '../models/usuarios-admin.interface.js';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
    private http = inject(HttpClient);
    private url = environment.apiUrl + '/usuarios/admin';

    listarUsuarios(): Observable<UsuarioAdmin[]> {
        return this.http.get<UsuarioAdmin[]>(this.url);
    }

    crearUsuario(datos: FormData): Observable<UsuarioAdmin> {
        return this.http.post<UsuarioAdmin>(this.url, datos);
    }

    deshabilitarUsuario(id: string): Observable<unknown> {
        return this.http.delete(`${this.url}/${id}`);
    }

    habilitarUsuario(id: string): Observable<unknown> {
        return this.http.post(`${this.url}/${id}/habilitar`, {});
    }
}
