import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion } from './schemas/publicaciones.schema.js';
import { Comentario } from '../comentarios/schemas/comentario.schema.js';

interface RangoFechas {
    desde: Date;
    hastaExclusivo: Date;
}

@Injectable()
export class EstadisticasService {
    constructor(
        @InjectModel(Publicacion.name)
        private readonly publicacionesModel: Model<Publicacion>,
        @InjectModel(Comentario.name)
        private readonly comentariosModel: Model<Comentario>
    ) { }

    async publicacionesPorUsuario(
        desdeTexto: string,
        hastaTexto: string
    ) {
        const rango = this.validarRango(desdeTexto, hastaTexto);

        return this.publicacionesModel.aggregate([
            {
                $match: {
                    eliminada: false,
                    createdAt: {
                        $gte: rango.desde,
                        $lt: rango.hastaExclusivo
                    }
                }
            },
            {
                $group: {
                    _id: '$autor',
                    cantidad: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'usuarios',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'usuario'
                }
            },
            { $unwind: '$usuario' },
            {
                $project: {
                    _id: 0,
                    usuarioId: '$_id',
                    nombre: '$usuario.nombre',
                    apellido: '$usuario.apellido',
                    username: '$usuario.username',
                    cantidad: 1
                }
            },
            { $sort: { cantidad: -1, username: 1 } }
        ]).exec();
    }

    async comentariosPorDia(
        desdeTexto: string,
        hastaTexto: string
    ) {
        const rango = this.validarRango(desdeTexto, hastaTexto);

        return this.comentariosModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: rango.desde,
                        $lt: rango.hastaExclusivo
                    }
                }
            },
            {
                $lookup: {
                    from: 'publicacions',
                    localField: 'publicacion',
                    foreignField: '_id',
                    as: 'publicacion'
                }
            },
            { $unwind: '$publicacion' },
            { $match: {'publicacion.eliminada': false} },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$createdAt',
                            timezone: 'UTC'
                        }
                    },
                    cantidad: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    fecha: '$_id',
                    cantidad: 1
                }
            },
            { $sort: { fecha: 1 } }
        ]).exec();
    }

    async comentariosPorPublicacion(
        desdeTexto: string,
        hastaTexto: string
    ) {
        const rango = this.validarRango(desdeTexto, hastaTexto);

        return this.comentariosModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: rango.desde,
                        $lt: rango.hastaExclusivo
                    }
                }
            },
            {
                $lookup: {
                    from: 'publicacions',
                    localField: 'publicacion',
                    foreignField: '_id',
                    as: 'publicacion'
                }
            },
            { $unwind: '$publicacion' },
            { $match: {'publicacion.eliminada': false} },
            {
                $group: {
                    _id: '$publicacion._id',
                    titulo: { $first: '$publicacion.titulo' },
                    cantidad: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    publicacionId: '$_id',
                    titulo: 1,
                    cantidad: 1
                }
            },
            { $sort: { cantidad: -1, titulo: 1 } }
        ]).exec();
    }

    private validarRango(
        desdeTexto: string,
        hastaTexto: string
    ): RangoFechas {
        const validarFecha = (texto: string): Date | null => {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(texto ?? '')) {
                return null;
            }

            const [anio, mes, dia] = texto.split('-').map(Number);
            const fecha = new Date(Date.UTC(anio, mes - 1, dia));

            if (
                fecha.getUTCFullYear() !== anio ||
                fecha.getUTCMonth() !== mes - 1 ||
                fecha.getUTCDate() !== dia
            ) {
                return null;
            }

            return fecha;
        };

        const desde = validarFecha(desdeTexto);
        const hasta = validarFecha(hastaTexto);

        if (!desde || !hasta) {
            throw new BadRequestException(
                'Las fechas deben tener formato YYYY-MM-DD y ser validas'
            );
        }

        if (desde.getTime() > hasta.getTime()) {
            throw new BadRequestException(
                'La fecha desde no puede ser posterior a la fecha hasta',
            );
        }

        const hastaExclusivo = new Date(hasta);
        hastaExclusivo.setUTCDate(hastaExclusivo.getUTCDate() + 1);

        return { desde, hastaExclusivo };
    }
}
