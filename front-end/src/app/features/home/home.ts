import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PublicacionesService } from '../../core/services/publicaciones.service.js';
import { Publicacion } from '../../core/models/publicacion.interface.js';
import { PublicacionDetail } from '../publicacion-detail/publicacion-detail.js';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, PublicacionDetail],
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

  orden = 'fecha';
  pagina = signal(0);
  total = signal(0);
  limite = 5;

  titulo = '';
  texto = '';
  imagenSeleccionada = signal<File | null>(null);
  accionEnCurso = signal('');

  // Control del modal de eliminacion
  publicacionPendienteEliminar = signal<Publicacion | null>(null);
  eliminando = signal(false);

  readonly maxTitulo = 20;
  readonly maxTexto = 300;

  ngOnInit(): void {
    this.cargarPublicaciones();
  }

  cargarPublicaciones(): void {
    this.cargando.set(true);
    this.error.set('');

    this.publicacionesService
      .listar(this.orden, this.pagina() * this.limite, this.limite)
      .subscribe({
        next: (respuesta) => {
          this.publicaciones.set(respuesta.items);
          this.total.set(respuesta.total);
          this.cargando.set(false);
        },
        error: (error) => {
          const detalle = error?.error?.message;
          this.error.set(
            Array.isArray(detalle)
              ? detalle.join(', ')
              : detalle || 'No se pudieron cargar las publicaciones',
          );
          this.cargando.set(false);
        }
      }
    );
  }

  cambiarOrden(orden: string): void {
    this.orden = orden;
    this.pagina.set(0);
    this.cargarPublicaciones();
  }

  cambiarPagina(direccion: number): void {
    const nuevaPagina = this.pagina() + direccion;
    const totalPaginas = Math.ceil(this.total() / this.limite);

    if (nuevaPagina < 0 || nuevaPagina >= totalPaginas) {
      return;
    }

    this.pagina.set(nuevaPagina);
    this.cargarPublicaciones();
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
      this.imagenSeleccionada.set(null);
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type)) {
      this.error.set('Las imagenes deben ser JPG, PNG o WebP');
      input.value = '';
      this.imagenSeleccionada.set(null);
      return;
    }

    this.imagenSeleccionada.set(archivo);
  }

  crearPublicacion(): void {
    if (this.publicando()) return;

    const titulo = this.titulo.trim();
    const texto = this.texto.trim();

    if (!titulo || !texto) {
      this.error.set('Completa el titulo y el mensaje');
      return;
    }

    if (titulo.length > this.maxTitulo) {
      this.error.set('El titulo es muy largo (max: 20 caracteres)');
      return;
    }

    if (texto.length > this.maxTexto) {
      this.error.set('La descripcion es muy larga (max: 300 caracteres)');
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
        this.pagina.set(0);
        this.mensaje.set('La publicacion se creo correctamente');
        this.publicando.set(false);
        this.cargarPublicaciones();
      },
      error: (error) => {
        const detalle = error?.error?.message;
        this.error.set(
          Array.isArray(detalle)
            ? detalle.join(', ')
            : detalle || 'No se pudo crear la publicacion',
        );
        this.publicando.set(false);
      },
    });
  }

  alternarMeGusta(publicacion: Publicacion): void {
    if (this.accionEnCurso()) return;

    this.accionEnCurso.set(publicacion._id);
    this.error.set('');
    this.mensaje.set('');

    const peticion = publicacion.meGustaUsuario
      ? this.publicacionesService.quitarMeGusta(publicacion._id)
      : this.publicacionesService.darMeGusta(publicacion._id);

    peticion.subscribe({
      next: (respuesta) => {
        this.publicaciones.update((lista) =>
          lista.map((item) =>
            item._id === publicacion._id
              ? {
                ...item,
                cantidadMeGusta: respuesta.cantidadMeGusta,
                meGustaUsuario: respuesta.meGustaUsuario
              }
              : item
          )
        );
        this.accionEnCurso.set('');
      },
      error: (error) => {
        const detalle = error?.error?.message;
        this.error.set(
          Array.isArray(detalle)
            ? detalle.join(', ')
            : detalle || 'No se pudo actualizar el me gusta'
        );
        this.accionEnCurso.set('');
      }
    });
  }

  solicitarEliminar(publicacion: Publicacion): void {
    if (this.accionEnCurso() || this.eliminando()) return;

    this.error.set('');
    this.mensaje.set('');
    this.publicacionPendienteEliminar.set(publicacion);
  }

  cancelarEliminar(): void {
    if (this.eliminando()) return;

    this.publicacionPendienteEliminar.set(null);
  }

  confirmarEliminar(): void {
    const publicacion = this.publicacionPendienteEliminar();

    if (!publicacion || this.eliminando() || this.accionEnCurso()) return;

    this.eliminando.set(true);
    this.accionEnCurso.set(publicacion._id);
    this.error.set('');

    this.publicacionesService.eliminar(publicacion._id).subscribe({
      next: () => {
        this.publicacionPendienteEliminar.set(null);
        this.eliminando.set(false);
        this.accionEnCurso.set('');
        this.mensaje.set('La publicacion se elimino correctamente');

        if (this.publicaciones().length === 1 && this.pagina() > 0) {
          this.pagina.update((pagina) => pagina - 1);
        }

        this.cargarPublicaciones();
      },
      error: (error) => {
        const detalle = error?.error?.message;
        this.error.set(
          Array.isArray(detalle)
            ? detalle.join(', ')
            : detalle || 'No se pudo eliminar la publicacion'
        );
        this.eliminando.set(false);
        this.accionEnCurso.set('');
        this.publicacionPendienteEliminar.set(null);
      }
    });
  }

  get totalPaginas(): number {
    return Math.ceil(this.total() / this.limite);
  }
}
