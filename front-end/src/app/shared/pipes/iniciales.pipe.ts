import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'iniciales',
  standalone: true
})

export class InicialesPipe implements PipeTransform {
  transform(
    nombre: string | null | undefined,
    apellido?: string | null
  ): string {
    const primeraInicial = nombre?.trim().charAt(0) ?? '';
    const segundaInicial = apellido?.trim().charAt(0) ?? '';

    return `${primeraInicial}${segundaInicial}`.toUpperCase() || '?';
  }
}
