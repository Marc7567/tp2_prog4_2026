import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PublicacionesService } from '../../core/services/publicaciones.service.js';
import { Publicacion } from '../../core/models/publicacion.interface.js';
import { PublicacionDetail } from '../publicacion-detail/publicacion-detail.js';

@Component({
  selector: 'app-publicacion-page',
  standalone: true,
  imports: [PublicacionDetail, RouterLink],
  templateUrl: './publicacion-page.html',
  styleUrl: './publicacion-page.css',
})

export class PublicacionPage implements OnInit {
  private route = inject(ActivatedRoute);
  private publicacionesService = inject(PublicacionesService);
  private router = inject(Router);

  publicacion = signal<Publicacion | null>(null);
  cargando = signal(true);
  error = signal('');
  accionEnCurso = signal(false);
  publicacionPendienteEliminar = signal<Publicacion | null>(null);
  eliminando = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('No se encontro la publicacion.');
      this.cargando.set(false);

      return;
    }

    this.publicacionesService.obtenerPorId(id).subscribe({
      next: (publicacion) => { this.publicacion.set(publicacion); this.cargando.set(false); },
      error: (error) => {
        this.error.set(error?.error?.message || 'No se pudo cargar la publicacion.');
        this.cargando.set(false);
      }
    });
  }

  alternarMeGusta(): void {
    const publicacion = this.publicacion();

    if (!publicacion || this.accionEnCurso()) return;

    this.accionEnCurso.set(true);

    const peticion = publicacion.meGustaUsuario
      ? this.publicacionesService.quitarMeGusta(publicacion._id)
      : this.publicacionesService.darMeGusta(publicacion._id);

    peticion.subscribe({
      next: (respuesta) => {
        this.publicacion.update((actual) => {
          if (!actual) return actual;

          return {
            ...actual,
            cantidadMeGusta: respuesta.cantidadMeGusta,
            meGustaUsuario: respuesta.meGustaUsuario,
          };
        });

        this.accionEnCurso.set(false);
      },
      error: (error) => {
        const detalle = error?.error?.message;

        this.error.set(
          Array.isArray(detalle)
            ? detalle.join(', ')
            : detalle || 'No se pudo actualizar el me gusta',
        );

        this.accionEnCurso.set(false);
      },
    });
  }

  solicitarEliminar(publicacion: Publicacion): void {
    if (this.accionEnCurso() || this.eliminando()) return;

    this.error.set('');
    this.publicacionPendienteEliminar.set(publicacion);
  }

  cancelarEliminar(): void {
    if (this.eliminando()) return;

    this.publicacionPendienteEliminar.set(null);
  }

  confirmarEliminar(): void {
    const publicacion = this.publicacionPendienteEliminar();

    if (!publicacion || this.accionEnCurso() || this.eliminando()) {
      return;
    }

    this.eliminando.set(true);
    this.accionEnCurso.set(true);
    this.error.set('');

    this.publicacionesService.eliminar(publicacion._id).subscribe({
      next: () => {
        void this.router.navigate(['/home']);
      },
      error: (error) => {
        const detalle = error?.error?.message;

        this.error.set(
          Array.isArray(detalle)
            ? detalle.join(', ')
            : detalle || 'No se pudo eliminar la publicacion',
        );

        this.eliminando.set(false);
        this.accionEnCurso.set(false);
        this.publicacionPendienteEliminar.set(null);
      },
    });
  }
}
