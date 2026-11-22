import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comentario } from './schemas/comentario.schema.js';
import { Publicacion } from '../publicaciones/schemas/publicaciones.schema.js';
import { Usuario } from '../usuarios/schemas/usuario.schema.js';

@Injectable()
export class ComentariosService {
    constructor(
        @InjectModel(Comentario.name)
        private readonly comentarioModel: Model<Comentario>,
        @InjectModel(Publicacion.name)
        private readonly publicacionModel: Model<Publicacion>,
        @InjectModel(Usuario.name)
        private readonly usuarioModel: Model<Usuario>,
    ) {}

    async listarPorPublicacion(publicacionId: string, offset = 0, limit = 5) {
        this.validarId(publicacionId, 'publicacionId');
        this.validarPaginacion(offset, limit);

        const publicacion = await this.publicacionModel.findOne({
            _id: publicacionId,
            eliminada: false,
        }).exec();

        if (!publicacion) {
            throw new NotFoundException('La publicacion no existe o fue eliminada');
        }

        const [items, total] = await Promise.all([
            this.comentarioModel
                .find({ publicacion: new Types.ObjectId(publicacionId) })
                .populate('autor', 'nombre apellido username imagenPerfil')
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(limit)
                .exec(),
            this.comentarioModel.countDocuments({
                publicacion: new Types.ObjectId(publicacionId),
            }).exec(),
        ]);

        return { items, total, offset, limit };
    }

    async crear(publicacionId: string, usuarioId: string, mensaje: string) {
        this.validarId(publicacionId, 'publicacionId');
        const texto = mensaje?.trim();
        if (!texto || texto.length > 300) {
            throw new BadRequestException('El comentario debe tener menos de 300 caracteres');
        }

        const publicacion = await this.publicacionModel.findOne({
            _id: publicacionId,
            eliminada: false,
        }).exec();
        if (!publicacion) {
            throw new NotFoundException('La publicacion no existe o fue eliminada');
        }

        const comentario = await this.comentarioModel.create({
            mensaje: texto,
            autor: new Types.ObjectId(usuarioId),
            publicacion: new Types.ObjectId(publicacionId),
            modificado: false,
        });
        return comentario.populate('autor', 'nombre apellido username imagenPerfil');
    }

    async editar(id: string, usuarioId: string, mensaje: string) {
        this.validarId(id, 'comentarioId');
        
        const texto = mensaje?.trim();
        if (!texto || texto.length > 1000) {
            throw new BadRequestException('El comentario debe tener entre 1 y 1000 caracteres');
        }

        const comentario = await this.comentarioModel.findById(id).exec();
        if (!comentario) {
            throw new NotFoundException('Comentario no encontrado');
        }
        if (comentario.autor.toString() !== usuarioId) {
            throw new ForbiddenException('Solo podes editar tus propios comentarios');
        }

        const publicacion = await this.publicacionModel.findOne({
            _id: comentario.publicacion,
            eliminada: false,
        }).exec();

        if (!publicacion) {
            throw new NotFoundException('No puedes editar un comentario de una publicacion eliminada');
        }

        comentario.mensaje = texto;
        comentario.modificado = true;
        await comentario.save();
        return comentario.populate('autor', 'nombre apellido username imagenPerfil');
    }

    private validarPaginacion(offset: number, limit: number): void {
        if (!Number.isInteger(offset) || offset < 0) {
            throw new BadRequestException('offset debe ser un numero mayor o igual a 0');
        }
        if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
            throw new BadRequestException('limit debe ser un numero entre 1 y 20');
        }
    }

    private validarId(id: string, campo: string): void {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(`${campo} no es un ID valido`);
        }
    }
}
