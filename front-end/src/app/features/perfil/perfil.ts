import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Usuario } from '../../core/models/usuario.interface.js';
import { Publicacion } from '../../core/models/publicacion.interface.js';
import { AuthService } from '../../core/services/auth.service.js';
import { PerfilService } from '../../core/services/perfil.service.js';
import { PublicacionesService } from '../../core/services/publicaciones.service.js';
// import { Comentarios } from '../comentarios/comentarios.js';

@Component({
    selector: 'app-perfil',
    standalone: true,
    imports: [DatePipe],
    templateUrl: './perfil.html',
    styleUrl: './perfil.css',
})

export class Perfil implements OnInit {
    private perfilService = inject(PerfilService);
    private authService = inject(AuthService);
    private publicacionesService = inject(PublicacionesService);
    private router = inject(Router);

    usuario = signal<Usuario | null>(null);
    misPublicaciones = signal<Publicacion[]>([]);

    cargando = signal(true);
    cargandoPublicaciones = signal(false);

    error = signal('');
    errorPublicaciones = signal('');

    ngOnInit(): void {
        this.cargarPerfil();
    }

    // Cargamos los datos del usuario y sus publicaciones.
    cargarPerfil(): void {
        this.cargando.set(true);
        this.error.set('');

        this.perfilService.obtener().subscribe({
            next: (usuario) => {
                this.usuario.set(usuario);
                this.authService.actualizarUsuario(usuario);

                this.cargando.set(false);
                this.cargarMisPublicaciones(usuario);
            },
            error: () => {
                this.error.set('No se pudo cargar el perfil');
                this.cargando.set(false);
            },
        });
    }

    // Buscamos las ultimas tres publicaciones del usuario.
    cargarMisPublicaciones(usuario: Usuario): void {
        const usuarioConId = usuario as Usuario & { _id?: string };
        const usuarioId = usuario.id || usuarioConId._id;

        if (!usuarioId) {
            this.errorPublicaciones.set(
                'No se pudo identificar al usuario para cargar sus publicaciones'
            );
            return;
        }

        this.cargandoPublicaciones.set(true);
        this.errorPublicaciones.set('');

        this.publicacionesService.listar('fecha', 0, 3, usuarioId).subscribe({
            next: (respuesta) => {
                this.misPublicaciones.set(respuesta.items);
                this.cargandoPublicaciones.set(false);
            },
            error: () => {
                this.errorPublicaciones.set('No se pudieron cargar tus publicaciones');
                this.cargandoPublicaciones.set(false);
            },
        });
    }

    // Navegamos a la pagina independiente de edicion.
    editarPerfil(): void {
        this.router.navigate(['/editar-perfil']);
    }
}
