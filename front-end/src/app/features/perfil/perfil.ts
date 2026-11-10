import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Usuario } from '../../core/models/usuario.interface';
import { Publicacion } from '../../core/models/publicacion.interface';
import { AuthService } from '../../core/services/auth.service';
import { PerfilService } from '../../core/services/perfil.service';
import { PublicacionesService } from '../../core/services/publicaciones.service';

@Component({
    selector: 'app-perfil',
    standalone: true,
    imports: [FormsModule, DatePipe],
    templateUrl: './perfil.html',
    styleUrl: './perfil.css'
})

export class Perfil implements OnInit {
    private perfilService = inject(PerfilService);
    private authService = inject(AuthService);
    private publicacionesService = inject(PublicacionesService);

    usuario = signal<Usuario | null>(null);
    misPublicaciones = signal<Publicacion[]>([]);

    cargando = signal(true);
    cargandoPublicaciones = signal(false);
    guardando = signal(false);

    error = signal('');
    mensaje = signal('');
    errorPublicaciones = signal('');

    nombre = '';
    apellido = '';
    username = '';
    email = '';
    fechaNacimiento = '';
    descripcion = '';

    imagenSeleccionada: File | null = null;

    ngOnInit(): void {
        this.cargarPerfil();
    }

    cargarPerfil(): void {
        this.cargando.set(true);
        this.error.set('');

        this.perfilService.obtener().subscribe({
            next: (usuario) => {
                this.usuario.set(usuario);
                this.authService.actualizarUsuario(usuario);

                this.nombre = usuario.nombre;
                this.apellido = usuario.apellido;
                this.username = usuario.username;
                this.email = usuario.email;
                this.fechaNacimiento = usuario.fechaNacimiento?.slice(0, 10) ?? '';
                this.descripcion = usuario.descripcion ?? '';

                this.cargando.set(false);
                this.cargarMisPublicaciones(usuario);
            },
            error: () => {
                this.error.set('No se pudo cargar el perfil');
                this.cargando.set(false);
            },
        });
    }

    cargarMisPublicaciones(usuario: Usuario): void {
        const usuarioConId = usuario as Usuario & { _id?: string };
        const usuarioId = usuario.id || usuarioConId._id;

        if (!usuarioId) {
            this.errorPublicaciones.set('No se pudo identificar al usuario para cargar sus publicaciones');
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

    seleccionarImagen(event: Event): void {
        const input = event.target as HTMLInputElement;
        const archivo = input.files?.[0] ?? null;

        this.error.set('');

        if (!archivo) {
            this.imagenSeleccionada = null;
            return;
        }

        if (archivo.size > 5 * 1024 * 1024) {
            this.error.set('La imagen no puede superar los 5 MB');
            input.value = '';
            this.imagenSeleccionada = null;
            return;
        }

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type)) {
            this.error.set('Solo se admiten imagenes JPG, PNG o WebP');
            input.value = '';
            this.imagenSeleccionada = null;
            return;
        }

        this.imagenSeleccionada = archivo;
    }

    guardarDatos(): void {
        if (this.guardando()) return;

        const datos = new FormData();

        datos.append('nombre', this.nombre.trim());
        datos.append('apellido', this.apellido.trim());
        datos.append('username', this.username.trim());
        datos.append('email', this.email.trim());
        datos.append('fechaNacimiento', this.fechaNacimiento);
        datos.append('descripcion', this.descripcion.trim());

        if (this.imagenSeleccionada) {
            datos.append('imagenPerfil', this.imagenSeleccionada);
        }

        this.guardando.set(true);
        this.error.set('');
        this.mensaje.set('');

        this.perfilService.actualizar(datos).subscribe({
            next: (usuario) => {
                this.usuario.set(usuario);
                this.authService.actualizarUsuario(usuario);

                this.imagenSeleccionada = null;

                this.mensaje.set('Perfil actualizado correctamente');
                this.guardando.set(false);
            },
            error: (error) => {
                const detalle = error?.error?.message;

                this.error.set(
                    Array.isArray(detalle) ? detalle.join(', ') : detalle || 'No se pudo actualizar el perfil'
                );
                this.guardando.set(false);
            },
        });
    }
}
