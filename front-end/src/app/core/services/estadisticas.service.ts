import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment.js';

export interface PublicacionesPorUsuario {
    usuarioId: string;
    nombre: string;
    apellido: string;
    username: string;
    cantidad: number;
}

export interface ComentariosPorDia {
    fecha: string;
    cantidad: number;
}

export interface ComentariosPorPublicacion {
    publicacionId: string;
    titulo: string;
    cantidad: number;
}

@Injectable({
    providedIn: 'root',
})
export class EstadisticasService {
    private http = inject(HttpClient);
    private url = environment.apiUrl + '/publicaciones/estadisticas';

    private crearParametros(desde: string, hasta: string): HttpParams {
        return new HttpParams()
            .set('desde', desde)
            .set('hasta', hasta);
    }

    publicacionesPorUsuario(desde: string, hasta: string) {
        return this.http.get<PublicacionesPorUsuario[]>(
            `${this.url}/publicaciones-usuario`,
            { params: this.crearParametros(desde, hasta) }
        );
    }

    comentariosPorDia(desde: string, hasta: string) {
        return this.http.get<ComentariosPorDia[]>(
            `${this.url}/comentarios`,
            { params: this.crearParametros(desde, hasta) }
        );
    }

    comentariosPorPublicacion(desde: string, hasta: string) {
        return this.http.get<ComentariosPorPublicacion[]>(
            `${this.url}/comentarios-publicacion`,
            { params: this.crearParametros(desde, hasta) }
        );
    }
}
