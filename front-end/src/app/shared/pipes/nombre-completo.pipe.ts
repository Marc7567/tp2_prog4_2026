import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'nombreCompleto',
    standalone: true
})

export class NombreCompletoPipe implements PipeTransform {
    transform(
        nombre: string | null | undefined,
        apellido: string | null | undefined
    ): string {
        const nombreCompleto = [nombre, apellido]
            .filter((parte) => parte?.trim())
            .map((parte) => parte!.trim())
            .join(' ');

        return nombreCompleto || 'Usuario';
    }
}
