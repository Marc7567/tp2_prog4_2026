import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service.js';
import { Publicacion } from '../../core/models/publicacion.interface.js';
import { Usuario } from '../../core/models/usuario.interface.js';
import { RouterLink } from '@angular/router';
import { Comentarios } from '../comentarios/comentarios.js';
import { NombreCompletoPipe } from '../../shared/pipes/nombre-completo.pipe.js';
import { InicialesPipe } from '../../shared/pipes/iniciales.pipe.js';
import { TiempoTranscurridoPipe } from '../../shared/pipes/tiempo-transcurrido.pipe.js';
import { ConfirmarAccionDirective } from '../../shared/directives/confirmar-accion.directive.js';

@Component({
    selector: 'app-publicacion-detail',
    standalone: true,
    imports: [ 
        Comentarios, 
        RouterLink,
        NombreCompletoPipe,
        InicialesPipe,
        TiempoTranscurridoPipe,
        ConfirmarAccionDirective
    ],
    templateUrl: './publicacion-detail.html',
    styleUrl: './publicacion-detail.css',
})

export class PublicacionDetail {
    private authService = inject(AuthService);

    @Input({ required: true }) publicacion!: Publicacion;
    @Input() accionEnCurso = false;
    @Input() mostrarComentarios = true;

    @Output() meGusta = new EventEmitter<Publicacion>();
    @Output() eliminar = new EventEmitter<Publicacion>();

    puedeEliminar(): boolean {
        const usuario = this.authService.currentUser() as
            (Usuario & { _id?: string }) | null;

        if (!usuario) return false;

        const idUsuario = usuario.id || usuario._id;
        const idAutor = this.publicacion.autor?._id;

        return usuario.rol === 'administrador' || idUsuario === idAutor;
    }

    inicialAutor(): string {
        return this.publicacion.autor?.nombre?.charAt(0) || '?';
    }
}
