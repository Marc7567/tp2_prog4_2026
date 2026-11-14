import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
  
  publicacion = signal<Publicacion | null>(null);
  cargando = signal(true);
  error = signal('');

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
}
