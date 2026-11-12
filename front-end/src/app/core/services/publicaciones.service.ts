import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment.js';
import {Publicacion, RespuestaPublicaciones } from '../models/publicacion.interface.js';

@Injectable({
    providedIn: 'root',
})   

export class PublicacionesService {
    private http = inject(HttpClient);
    private url = environment.apiUrl + '/publicaciones';

    listar(
        orden = 'fecha',
        offset = 0,
        limit = 5,
        usuarioId?: string,
    ) {
        let params = new HttpParams()
            .set('orden', orden)
            .set('offset', offset)
            .set('limit', limit);

        if (usuarioId) {
            params = params.set('usuarioId', usuarioId);
        }

        return this.http.get<RespuestaPublicaciones>(this.url, { params });
    }

    crear(datos: FormData) {
        return this.http.post<Publicacion>(this.url, datos);
    }

    // eliminar publicacion
    eliminar(id: string) {
        return this.http.delete<{ mensaje: string }>(`${this.url}/${id}`);
    }

    // dar me gustas
    darMeGusta(id: string) {
        return this.http.post<{
            publicacionId: string;
            cantidadMeGusta: number;
            meGustaUsuario: boolean;
        }>(`${this.url}/${id}/me-gusta`, {});
    }

    // eliminar me gustas
    quitarMeGusta(id: string) {
        return this.http.delete<{
            publicacionId: string;
            cantidadMeGusta: number;
            meGustaUsuario: boolean;
        }>(`${this.url}/${id}/me-gusta`);
    }
}