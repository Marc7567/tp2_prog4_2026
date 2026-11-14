import { Component, Input, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComentariosService } from '../../core/services/comentarios.service.js';
import { Comentario } from '../../core/models/comentario.interface.js';
import { AuthService } from '../../core/services/auth.service.js';

@Component({
    selector: 'app-comentarios',
    standalone: true,
    imports: [DatePipe, FormsModule],
    templateUrl: './comentarios.html',
    styleUrl: './comentarios.css',
})

export class Comentarios implements OnInit {
    private comentariosService = inject(ComentariosService);
    private authService = inject(AuthService);

    @Input({ required: true }) publicacionId!: string;

    comentarios: Comentario[] = [];
    total = 0;
    offset = 0;
    readonly limite = 5;

    nuevoComentario = '';
    comentarioEditando: string | null = null;
    textoEdicion = '';

    cargando = false;
    cargandoMas = false;
    enviando = false;

    error = '';
    mensaje = '';

    ngOnInit(): void {
        this.cargarComentarios();
    }

    cargarComentarios(): void {
        this.cargando = true;
        this.error = '';

        this.comentariosService.listar(
            this.publicacionId,
            0,
            this.limite,
        ).subscribe({
            next: (respuesta) => {
                this.comentarios = respuesta.items;
                this.total = respuesta.total;
                this.offset = respuesta.items.length;
                this.cargando = false;
            },
            error: () => {
                this.error = 'No se pudieron cargar los comentarios.';
                this.cargando = false;
            },
        });
    }

    cargarMas(): void {
        if (this.cargandoMas || this.comentarios.length >= this.total) {
            return;
        }

        this.cargandoMas = true;
        this.error = '';

        this.comentariosService.listar(
            this.publicacionId,
            this.offset,
            this.limite,
        ).subscribe({
            next: (respuesta) => {
                this.comentarios = [
                    ...this.comentarios,
                    ...respuesta.items,
                ];

                this.total = respuesta.total;
                this.offset += respuesta.items.length;
                this.cargandoMas = false;
            },
            error: () => {
                this.error = 'No se pudieron cargar mas comentarios.';
                this.cargandoMas = false;
            },
        });
    }

    crearComentario(): void {
        const mensaje = this.nuevoComentario.trim();

        if (!mensaje || this.enviando) {
            return;
        }

        this.enviando = true;
        this.error = '';
        this.mensaje = '';

        this.comentariosService.crear(
            this.publicacionId,
            mensaje,
        ).subscribe({
            next: (comentario) => {
                this.comentarios = [
                    comentario,
                    ...this.comentarios,
                ];

                this.total++;
                this.offset++;
                this.nuevoComentario = '';
                this.enviando = false;
                this.mensaje = 'Comentario publicado correctamente.';
            },
            error: () => {
                this.error = 'No se pudo publicar el comentario.';
                this.enviando = false;
            },
        });
    }

    Editar(comentario: Comentario): boolean {
        const usuario = this.authService.currentUser();

        if (!usuario) {
            return false;
        }

        const idUsuario = usuario.id || (usuario as { _id?: string })._id;

        return idUsuario === comentario.autor._id;
    }

    iniciarEdicion(comentario: Comentario): void {
        this.comentarioEditando = comentario._id;
        this.textoEdicion = comentario.mensaje;
        this.error = '';
        this.mensaje = '';
    }

    cancelarEdicion(): void {
        this.comentarioEditando = null;
        this.textoEdicion = '';
    }

    guardarEdicion(comentario: Comentario): void {
        const mensaje = this.textoEdicion.trim();

        if (!mensaje) {
            this.error = 'El comentario no puede estar vacio.';
            return;
        }

        this.error = '';
        this.mensaje = '';

        this.comentariosService.editar(
            comentario._id,
            mensaje,
        ).subscribe({
            next: (comentarioActualizado) => {
                this.comentarios = this.comentarios.map((item) =>
                    item._id === comentario._id
                        ? comentarioActualizado
                        : item,
                );

                this.cancelarEdicion();
                this.mensaje = 'Comentario editado correctamente.';
            },
            error: () => {
                this.error = 'No se pudo editar el comentario.';
            },
        });
    }
}
