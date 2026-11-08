import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Publicacion } from '../models/publicacion.interface';

@Injectable({
    providedIn: 'root',
})

export class PublicacionesService {
    private http = inject(HttpClient);
    private url = environment.apiUrl + '/publicaciones';

    listar() {
        return this.http.get<Publicacion[]>(this.url);
    }

    crear(datos: FormData) {
        return this.http.post<Publicacion>(this.url, datos);
    }
}