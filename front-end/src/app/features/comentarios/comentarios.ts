import { Component, Input, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ComentariosService } from '../../core/services/comentarios.service.js';
import { Comentario } from '../../core/models/comentario.interface.js';

@Component({
    selector: 'app-comentarios',
    standalone: true,
    imports: [DatePipe],
    templateUrl: './comentarios.html',
    styleUrl: './comentarios.css',
})

export class Comentarios implements OnInit {
    private comentariosService = inject(ComentariosService);

    @Input({ required: true }) publicacionId!: string;

    comentarios: Comentario[] = [];
    cargando = false;
    error = '';

    ngOnInit(): void {
        this.cargarComentarios();
    }

    cargarComentarios(): void {
        this.cargando = true;
        this.error = '';

        this.comentariosService.listar(this.publicacionId).subscribe({
            next: (comentarios) => {
                this.comentarios = comentarios;
                this.cargando = false;
            },
            error: () => {
                this.error = 'No se pudieron cargar los comentarios.';
                this.cargando = false;
            },
        });
    }
}
