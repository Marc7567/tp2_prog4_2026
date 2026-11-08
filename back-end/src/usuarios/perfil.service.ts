import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario } from './schemas/usuario.schema';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';

@Injectable()
export class PerfilService {
    constructor(
        @InjectModel(Usuario.name)
        private readonly usuarioModel: Model<any>,
    ) { }

    private respuestaPublica(usuario: any) {
        return {
            id: usuario._id.toString(),
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            username: usuario.username,
            email: usuario.email,
            fechaNacimiento: usuario.fechaNacimiento,
            descripcion: usuario.descripcion,
            imagenPerfil: usuario.imagenPerfil,
            rol: usuario.rol,
            createdAt: usuario.createdAt,
            updatedAt: usuario.updatedAt,
        };
    }

    async obtener(id: string) {
        const usuario = await this.usuarioModel
            .findById(id)
            .exec();

        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }

        return this.respuestaPublica(usuario);
    }

    async actualizar(
        id: string,
        datos: ActualizarPerfilDto,
        nuevaImagen?: string
    ) {
        const email = datos.email.trim().toLowerCase();
        const username = datos.username.trim().toLowerCase();

        const duplicado = await this.usuarioModel.findOne({
            _id: { $ne: id },
            $or: [
                { email },
                { username }
            ]
        }).select('_id').exec();

        if (duplicado) {
            throw new ConflictException('El email o el username ya estan registrados');
        }

        const actualizaciones: Record<string, any> = {
            nombre: datos.nombre.trim(),
            apellido: datos.apellido.trim(),
            email,
            username,
            fechaNacimiento: datos.fechaNacimiento,
            descripcion: datos.descripcion.trim()
        };

        if (nuevaImagen) {
            actualizaciones.imagenPerfil = nuevaImagen;
        }

        try {
            const usuario = await this.usuarioModel
                .findByIdAndUpdate(
                    id,
                    actualizaciones,
                    {
                        new: true,
                        runValidators: true,
                    },
                )
                .exec();

            if (!usuario) {
                throw new NotFoundException('Usuario no encontrado');
            }

            return this.respuestaPublica(usuario);

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            const errorMongo = error as { code?: number };

            if (errorMongo.code === 11000) {
                throw new ConflictException('El email o el username ya estan registrados');
            }

            throw error;
        }
    }
}