import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion } from './schemas/publicaciones.schema';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { Usuario } from '../usuarios/schemas/usuario.schema';

@Injectable()
export class PublicacionesService {
    constructor(
        @InjectModel(Publicacion.name)
        private readonly modelo: Model<Publicacion>,
        @InjectModel(Usuario.name)
        private readonly usuarios: Model<Usuario>,
    ) {}

    async crear(datos: CrearPublicacionDto, usuarioId: string, imagenPublicId = '') {
        const publicacion = await this.modelo.create({
            titulo: datos.titulo.trim(),
            mensaje: datos.mensaje.trim(),
            imagen: datos.imagen?.trim() ?? '',
            imagenPublicId,
            autor: new Types.ObjectId(usuarioId)
        });

        const resultado = await publicacion.populate({
            path: 'autor',
            select: 'nombre apellido username imagenPerfil'
        });

        return {
            _id: resultado._id,
            titulo: resultado.titulo,
            mensaje: resultado.mensaje,
            imagen: resultado.imagen,
            autor: resultado.autor,
            meGusta: [],
            cantidadMeGusta: 0,
            meGustaUsuario: false,
            createdAt: resultado.createdAt,
            updatedAt: resultado.updatedAt
        };
    }

    async listar(
        usuarioActualId: string,
        orden = 'fecha',
        usuarioId?: string,
        offset = 0,
        limit = 10
    ) {
        if (!['fecha', 'meGusta'].includes(orden)) {
            throw new BadRequestException('El orden debe ser por fecha o por Me Gustas');
        }

        if (!Number.isInteger(offset) || offset < 0) {
            // offset
            throw new BadRequestException('Debe ser un numero mayor o igual a 0');
        }

        if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
            // limit
            throw new BadRequestException('Debe ser un numero entre 1 y 50');
        }

        if (usuarioId && !Types.ObjectId.isValid(usuarioId)) {
            throw new BadRequestException('usuario invalido');
        }

        const filtro: Record<string, any> = { eliminada: false };

        if (usuarioId) {
            filtro.autor = new Types.ObjectId(usuarioId);
        }

        const ordenamiento = orden === 'meGusta' ? -1 : 1;

        const [publicaciones, total] = await Promise.all([
            this.modelo
                .aggregate([
                    { $match: filtro },
                    {
                        $addFields: {
                            cantidadMeGusta: { $size: { $ifNull: ['$meGusta', []] } },
                        },
                    },
                    {
                        $sort: orden === 'meGusta' ? { cantidadMeGusta: -1, createdAt: -1 } : { createdAt: -1 },
                    },
                    { $skip: offset },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: 'usuarios',
                            localField: 'autor',
                            foreignField: '_id',
                            as: 'autor'
                        }
                    },
                    { $unwind: '$autor' },
                    {
                        $project: {
                            titulo: 1,
                            mensaje: 1,
                            imagen: 1,
                            autor: {
                                _id: '$autor._id',
                                nombre: '$autor.nombre',
                                apellido: '$autor.apellido',
                                username: '$autor.username',
                                imagenPerfil: '$autor.imagenPerfil'
                            },
                            createdAt: 1,
                            updatedAt: 1,
                            cantidadMeGusta: 1,
                            meGustaUsuario: {
                                $in: [
                                    new Types.ObjectId(usuarioActualId),
                                    { $ifNull: ['$meGusta', []] },
                                ]
                            }
                        }
                    }
                ])
                .exec(),
            this.modelo.countDocuments(filtro).exec(),
        ]);

        return { items: publicaciones, total, offset, limit };
    }

    async eliminar(id: string, usuarioId: string) {
        const publicacion = await this.buscarActiva(id);
        const usuario = await this.usuarios.findById(usuarioId).select('rol').exec();

        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const esAutor = publicacion.autor.toString() === usuarioId;
        const esAdministrador = usuario.rol === 'administrador';

        if (!esAutor && !esAdministrador) {
            throw new ForbiddenException('No tienes permiso para eliminar esta publicacion');
        }

        await this.modelo.updateOne(
            { _id: publicacion._id, eliminada: false },
            { $set: { eliminada: true } }
        ).exec();

        return { mensaje: 'Publicacion eliminada correctamente' };
    }

    async darMeGusta(id: string, usuarioId: string) {
        const publicacion = await this.buscarActiva(id);

        await this.modelo.updateOne(
            { _id: publicacion._id, eliminada: false },
            { $addToSet: { meGusta: new Types.ObjectId(usuarioId) } },
        ).exec();

        return this.obtenerEstadoMeGusta(id, usuarioId);
    }

    async quitarMeGusta(id: string, usuarioId: string) {
        const publicacion = await this.buscarActiva(id);
        const yaLeGusta = (publicacion.meGusta ?? [])
            .some((idUsuario) => idUsuario.toString() === usuarioId);

        if (!yaLeGusta) {
            throw new NotFoundException('No habias dado me gusta a esta publicacion');
        }

        await this.modelo.updateOne(
            { _id: publicacion._id, eliminada: false },
            { $pull: { meGusta: new Types.ObjectId(usuarioId)}}
        ).exec();

        return this.obtenerEstadoMeGusta(id, usuarioId);
    }

    private async obtenerEstadoMeGusta(id: string, usuarioId: string) {
        const publicacion = await this.modelo
            .findOne({ _id: id, eliminada: false })
            .select('+meGusta')
            .exec();

        if (!publicacion) {
            throw new NotFoundException('Publicacion no encontrada');
        }

        const likes = publicacion.meGusta ?? [];

        return {
            publicacionId: id,
            cantidadMeGusta: likes.length,
            meGustaUsuario: likes.some((idUsuario) => idUsuario.toString() === usuarioId)
        };
    }

    private async buscarActiva(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('ID de publicacion invalido');
        }

        const publicacion = await this.modelo
            .findOne({ _id: id, eliminada: false })
            .select('+meGusta')
            .exec();

        if (!publicacion) {
            throw new NotFoundException('Publicacion no encontrada');
        }

        return publicacion;
    }
}
