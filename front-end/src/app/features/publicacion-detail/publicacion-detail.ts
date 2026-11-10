import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Publicacion } from '../../core/models/publicacion.interface';
import { Usuario } from '../../core/models/usuario.interface';

@Component({
    selector: 'app-publicacion-detail',
    standalone: true,
    imports: [DatePipe],
    templateUrl: './publicacion-detail.html',
    styleUrl: './publicacion-detail.css',
})
export class PublicacionDetail {
    private authService = inject(AuthService);

    @Input({ required: true }) publicacion!: Publicacion;
    @Input() accionEnCurso = false;

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
