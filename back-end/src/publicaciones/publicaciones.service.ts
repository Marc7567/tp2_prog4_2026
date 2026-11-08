import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion } from './schemas/publicaciones.schema';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';

@Injectable()
export class PublicacionesService {
    constructor(
        @InjectModel(Publicacion.name)
        private readonly modelo: Model<Publicacion>,
    ) {}

    async crear(
        datos: CrearPublicacionDto,
        usuarioId: string,
        imagenPublicId = '',
    ) {
        const publicacion = await this.modelo.create({
            titulo: datos.titulo.trim(),
            mensaje: datos.mensaje.trim(),
            imagen: datos.imagen?.trim() ?? '',
            imagenPublicId,
            autor: new Types.ObjectId(usuarioId),
        });

        const resultado = await publicacion.populate({
            path: 'autor',
            select: 'nombre apellido username imagenPerfil',
        });

        // No devolver el identificador interno de Cloudinary.
        return {
            _id: resultado._id,
            titulo: resultado.titulo,
            mensaje: resultado.mensaje,
            imagen: resultado.imagen,
            autor: resultado.autor,
            createdAt: resultado.createdAt,
            updatedAt: resultado.updatedAt,
            __v: resultado.__v,
        };
    }

    async listar() {
        return this.modelo
            .find()
            .populate(
                'autor',
                'nombre apellido username imagenPerfil'
            )
            .sort({ createdAt: -1 })
            .exec();
    }
}