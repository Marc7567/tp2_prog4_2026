import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'tiempoTranscurrido',
    standalone: true,
})

export class TiempoTranscurridoPipe implements PipeTransform {
    transform(fecha: string | Date | null | undefined): string {
        if (!fecha) {
            return 'Fecha desconocida';
        }

        const fechaPublicacion = new Date(fecha).getTime();

        if (Number.isNaN(fechaPublicacion)) {
            return 'Fecha desconocida';
        }

        const diferencia = Math.max(
            0,
            Date.now() - fechaPublicacion,
        );

        const minutos = Math.floor(diferencia / 60000);
        const horas = Math.floor(diferencia / 3600000);
        const dias = Math.floor(diferencia / 86400000);

        if (minutos < 1) return 'Hace unos segundos';
        if (minutos < 60) return `Hace ${minutos} min`;
        if (horas < 24) return `Hace ${horas} h`;
        if (dias < 30) return `Hace ${dias} dias`;

        const meses = Math.floor(dias / 30);
        if (meses < 12) return `Hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`;

        const anios = Math.floor(dias / 365);
        return `Hace ${anios} ${anios === 1 ? 'año' : 'años'}`;
    }
}
