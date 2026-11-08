import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Usuario } from '../models/usuario.interface';

@Injectable({
    providedIn: 'root',
})

export class PerfilService {
    private http = inject(HttpClient);
    private url = environment.apiUrl + '/usuarios/me';

    obtener() {
        return this.http.get<Usuario>(this.url);
    }

    actualizar(datos: FormData) {
        return this.http.patch<Usuario>(this.url, datos);
    }
}
