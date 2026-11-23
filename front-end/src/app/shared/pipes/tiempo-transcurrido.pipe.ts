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

        const fechaPublicacion = new Date(fecha);

        if (Number.isNaN(fechaPublicacion.getTime())) {
            return 'Fecha desconocida';
        }

        const ahora = new Date();
        const diferencia = Math.max(
            0,
            ahora.getTime() - fechaPublicacion.getTime()
        );

        const segundos = Math.floor(diferencia / 1000);
        const minutos = Math.floor(diferencia / 60000);
        const horas = Math.floor(diferencia / 3600000);
        const dias = Math.floor(diferencia / 86400000);

        if (segundos < 60) {
            return `Hace ${segundos} ${segundos === 1 ? 'segundo' : 'segundos'}`;
        }

        if (minutos < 60) {
            return `Hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
        }

        if (horas < 24) {
            return `Hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
        }

        if (dias < 30) {
            return `Hace ${dias} ${dias === 1 ? 'dia' : 'dias'}`;
        }

        const meses = Math.floor(dias / 30);

        if (meses < 12) {
            return `Hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
        }

        const anios = Math.floor(dias / 365);

        return `Hace ${anios} ${anios === 1 ? 'año' : 'años'}`;
    }
}
