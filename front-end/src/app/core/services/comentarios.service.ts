import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment.js';
import { Comentario } from '../models/comentario.interface.js';

export interface RespuestaComentarios {
    items: Comentario[];
    total: number;
    offset: number;
    limit: number;
}

@Injectable({ providedIn: 'root' })
export class ComentariosService {
    private http = inject(HttpClient);
    private url = environment.apiUrl + '/comentarios';

    listar(publicacionId: string, offset = 0, limit = 5) {
        const params = new HttpParams().set('offset', offset).set('limit', limit);
        return this.http.get<RespuestaComentarios>(
            `${this.url}/publicacion/${publicacionId}`, {params}
        );
    }

    crear(publicacionId: string, mensaje: string) {
        return this.http.post<Comentario>(`${this.url}/publicacion/${publicacionId}`, { mensaje });
    }

    editar(id: string, mensaje: string) {
        return this.http.put<Comentario>(`${this.url}/${id}`, { mensaje });
    }
}
