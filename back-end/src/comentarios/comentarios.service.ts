import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comentario } from './schemas/comentario.schema';
import { Publicacion } from '../publicaciones/schemas/publicaciones.schema';

@Injectable()
export class ComentariosService {
    constructor(
        @InjectModel(Comentario.name)
        private readonly comentarioModel: Model<Comentario>,
        @InjectModel(Publicacion.name)
        private readonly publicacionModel: Model<Publicacion>,
    ) {}

    async listarPorPublicacion(publicacionId: string) {
        this.validarId(publicacionId, 'publicacionId');

        const publicacion = await this.publicacionModel.findOne({
            _id: publicacionId,
            eliminada: false
        });

        if (!publicacion) {
            throw new NotFoundException('La publicacion no existe o fue eliminada');
        }

        return this.comentarioModel
            .find({publicacion: new Types.ObjectId(publicacionId)})
            .populate('autor', 'nombre apellido username imagenPerfil')
            .sort({ createdAt: 1 })
            .exec();
    }

    private validarId(id: string, campo: string): void {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(`${campo} no es un ID valido`);
        }
    }
}
