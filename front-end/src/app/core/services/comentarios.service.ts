import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Comentario } from '../models/comentario.interface';

@Injectable({
    providedIn: 'root',
})

export class ComentariosService {
    private http = inject(HttpClient);
    private url = environment.apiUrl + '/comentarios';

    listar(publicacionId: string) {
        return this.http.get<Comentario[]>(`${this.url}/publicacion/${publicacionId}`);
    }
}
