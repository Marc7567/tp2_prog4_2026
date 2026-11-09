import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PublicacionesService } from '../../core/services/publicaciones.service';
import { Publicacion } from '../../core/models/publicacion.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})

export class Home implements OnInit {
  private publicacionesService = inject(PublicacionesService);

  publicaciones = signal<Publicacion[]>([]);
  cargando = signal(true);
  publicando = signal(false);

  error = signal('');
  mensaje = signal('');

  titulo = '';
  texto = '';

  imagenSeleccionada = signal<File | null>(null);

  ngOnInit(): void {
    this.cargarPublicaciones();
  }

  cargarPublicaciones(): void {
    this.cargando.set(true);
    this.error.set('');

    this.publicacionesService.listar().subscribe({
      next: (datos) => {
        this.publicaciones.set(datos);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las publicaciones');
        this.cargando.set(false);
      },
    });
  }

  seleccionarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;

    this.error.set('');

    if (!archivo) {
      this.imagenSeleccionada.set(null);
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      this.error.set('La imagen debe pesar menos de 5 MB');
      input.value = '';
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type)) {
      this.error.set('Las imagenes deben ser JPG, PNG o WebP');
      input.value = '';
      return;
    }

    this.imagenSeleccionada.set(archivo);
  }

  crearPublicacion(): void {
    if (this.publicando()) {
      return;
    }

    const titulo = this.titulo.trim();
    const texto = this.texto.trim();

    if (!titulo || !texto) {
      this.error.set('Completa el titulo y el mensaje');
      return;
    }

    const datos = new FormData();

    datos.append('titulo', titulo);
    datos.append('mensaje', texto);

    const imagen = this.imagenSeleccionada();

    if (imagen) {
      datos.append('imagen', imagen);
    }

    this.publicando.set(true);
    this.error.set('');
    this.mensaje.set('');

    this.publicacionesService.crear(datos).subscribe({
      next: () => {
        this.titulo = '';
        this.texto = '';
        this.imagenSeleccionada.set(null);

        this.mensaje.set('La Publicacion se creo correctamente');

        this.publicando.set(false);
        this.cargarPublicaciones();
      },
      error: (error) => {
        const detalle = error?.error?.message;

        this.error.set(
          Array.isArray(detalle)
            ? detalle.join(', ')
            : detalle || 'No se pudo crear la publicacion'
        );

        this.publicando.set(false);
      },
    });
  }
}