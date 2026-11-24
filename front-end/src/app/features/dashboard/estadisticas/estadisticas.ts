import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { EstadisticasService, PublicacionesPorUsuario, ComentariosPorDia, ComentariosPorPublicacion } from '../../../core/services/estadisticas.service.js';

interface PuntoGrafico {
  x: number;
  y: number;
  fecha: string;
  cantidad: number;
}

const COLORES = ['#5260ff', '#10a7a0', '#f59e0b', '#e879a9', '#8b5cf6', '#64748b'];

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css'
})

export class Estadisticas implements OnInit {
  private estadisticasService = inject(EstadisticasService);
  private cdr = inject(ChangeDetectorRef);

  desde = '';
  hasta = '';

  publicaciones: PublicacionesPorUsuario[] = [];
  comentariosDiarios: ComentariosPorDia[] = [];
  comentariosPublicaciones: ComentariosPorPublicacion[] = [];

  cargando = false;
  error = '';
  errorDesde = '';
  errorHasta = '';
  errorGeneral = '';
  filtrosInvalidos = false;
  consultado = false;

  private mostrarErroresValidacion = false;

  ngOnInit(): void {
    const hoy = new Date();
    const inicio = new Date(hoy);
    inicio.setDate(inicio.getDate() - 29);

    this.desde = this.fechaLocal(inicio);
    this.hasta = this.fechaLocal(hoy);

    this.cargarEstadisticas();
  }

  private fechaLocal(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }

  private fechaValida(fecha: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;

    const [anio, mes, dia] = fecha.split('-').map(Number);
    const fechaObjeto = new Date(anio, mes - 1, dia);

    return fechaObjeto.getFullYear() === anio
      && fechaObjeto.getMonth() === mes - 1
      && fechaObjeto.getDate() === dia
      && anio > 0;
  }

  private finalizarCarga(): void {
    this.cargando = false;
    this.cdr.markForCheck();
  }

  cargarEstadisticas(): void {
    this.error = '';
    this.filtrosInvalidos = false;
    this.mostrarErroresValidacion = true;

    if (!this.validarFechas()) {
      this.filtrosInvalidos = true;
      return;
    }

    this.cargando = true;
    this.consultado = false;

    forkJoin({
      publicaciones: this.estadisticasService.publicacionesPorUsuario(this.desde, this.hasta),
      comentariosDia: this.estadisticasService.comentariosPorDia(this.desde, this.hasta),
      comentariosPublicacion: this.estadisticasService.comentariosPorPublicacion(this.desde, this.hasta),
    }).subscribe({
      next: (datos) => {
        this.publicaciones = datos.publicaciones;
        this.comentariosDiarios = this.completarDias(datos.comentariosDia);
        this.comentariosPublicaciones = datos.comentariosPublicacion;
        this.consultado = true;

        this.finalizarCarga();
      },
      error: () => {
        this.error = 'No se pudieron cargar las estadisticas.';
        this.finalizarCarga();
      },
    });
  }

  private completarDias(datos: ComentariosPorDia[]): ComentariosPorDia[] {
    const cantidades = new Map(
      datos.map((dato) => [dato.fecha, dato.cantidad])
    );

    const resultado: ComentariosPorDia[] = [];
    const fechaActual = new Date(`${this.desde}T12:00:00`);
    const fechaFinal = new Date(`${this.hasta}T12:00:00`);

    while (fechaActual <= fechaFinal) {
      const fecha = this.fechaLocal(fechaActual);

      resultado.push({
        fecha,
        cantidad: cantidades.get(fecha) ?? 0
      });

      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    return resultado;
  }

  nombreUsuario(usuario: PublicacionesPorUsuario): string {
    const nombre = `${usuario.nombre} ${usuario.apellido}`.trim();
    return nombre || usuario.username;
  }

  get maxPublicaciones(): number {
    return Math.max(1, ...this.publicaciones.map((p) => p.cantidad));
  }

  get maxComentariosDia(): number {
    return Math.max(1, ...this.comentariosDiarios.map((c) => c.cantidad));
  }

  get totalComentarios(): number {
    return this.comentariosDiarios.reduce(
      (total, dato) => total + dato.cantidad,
      0
    );
  }

  get totalComentariosPorPublicacion(): number {
    return this.comentariosPublicaciones.reduce(
      (total, dato) => total + dato.cantidad,
      0
    );
  }

  get puntosLinea(): PuntoGrafico[] {
    const datos = this.comentariosDiarios;
    const maximo = this.maxComentariosDia;

    return datos.map((dato, indice) => {
      const x = datos.length <= 1
        ? 300
        : 30 + (indice / (datos.length - 1)) * 540;

      const y = 185 - (dato.cantidad / maximo) * 145;

      return {
        x,
        y,
        fecha: dato.fecha,
        cantidad: dato.cantidad
      };
    });
  }

  get coordenadasLinea(): string {
    return this.puntosLinea
      .map((punto) => `${punto.x},${punto.y}`)
      .join(' ');
  }

  get gradienteDona(): string {
    const total = this.totalComentariosPorPublicacion;
    if (!total) return 'conic-gradient(#e7eaf0 0% 100%)';

    let acumulado = 0;

    const segmentos = this.comentariosPublicaciones.map((dato, i) => {
      const inicio = acumulado;
      acumulado += dato.cantidad / total * 100;
      return `${COLORES[i % COLORES.length]} ${inicio}% ${acumulado}%`;
    });

    return `conic-gradient(${segmentos.join(', ')})`;
  }

  colorDona(indice: number): string {
    return COLORES[indice % COLORES.length];
  }

  porcentajeComentarios(cantidad: number): number {
    const total = this.totalComentariosPorPublicacion;
    return total ? Math.round((cantidad / total) * 100) : 0;
  }

  fechaCorta(fecha: string): string {
    const [anio, mes, dia] = fecha.split('-');
    return `${dia}/${mes}`;
  }

  reintentar(): void {
    this.cargarEstadisticas();
  }

  get fechaMaxima(): string {
    return this.fechaLocal(new Date());
  }

  get fechaMaximaDesde(): string {
    const hoy = this.fechaMaxima;

    if (!this.fechaValida(this.hasta)) {
      return hoy;
    }

    const diaAnteriorHasta = new Date(`${this.hasta}T12:00:00`);
    diaAnteriorHasta.setDate(diaAnteriorHasta.getDate() - 1);

    const limiteHasta = this.fechaLocal(diaAnteriorHasta);

    return limiteHasta < hoy ? limiteHasta : hoy;
  }

  get fechaMinimaHasta(): string {
    if (!this.fechaValida(this.desde)) return '';

    const diaSiguienteDesde = new Date(`${this.desde}T12:00:00`);
    diaSiguienteDesde.setDate(diaSiguienteDesde.getDate() + 1);

    return this.fechaLocal(diaSiguienteDesde);
  }

  get fechaMediaComentarios(): string {
    if (!this.comentariosDiarios.length) {
      return '';
    }

    const indice = Math.floor(
      (this.comentariosDiarios.length - 1) / 2,
    );

    return this.fechaCorta(
      this.comentariosDiarios[indice].fecha,
    );
  }

  private validarFechas(): boolean {
    this.errorDesde = '';
    this.errorHasta = '';
    this.errorGeneral = '';

    const hoy = this.fechaMaxima;

    if (!this.desde) {
      this.errorDesde = 'Seleccione una fecha de inicio.';
    } else if (!this.fechaValida(this.desde)) {
      this.errorDesde = 'Ingrese una fecha valida.';
    } else if (this.desde > hoy) {
      this.errorDesde = 'No puede ser una fecha futura.';
    }

    if (!this.hasta) {
      this.errorHasta = 'Seleccione una fecha de finalizacion.';
    } else if (!this.fechaValida(this.hasta)) {
      this.errorHasta = 'Ingrese una fecha valida.';
    } else if (this.hasta > hoy) {
      this.errorHasta = 'No puede ser una fecha futura.';
    }

    if (!this.errorDesde && !this.errorHasta && this.desde >= this.hasta) {
      if (this.desde === this.hasta) {
        this.errorGeneral = 'Las fechas no pueden ser iguales.';
      } else {
        this.errorDesde = 'Debe ser anterior a la fecha de fin.';
      }
    }

    return !this.errorDesde && !this.errorHasta && !this.errorGeneral;
  }

  validarFechasAlCambiar(): void {
    if (!this.mostrarErroresValidacion) return;

    this.filtrosInvalidos = !this.validarFechas();
  }
}
