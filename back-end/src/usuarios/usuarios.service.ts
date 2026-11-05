import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { hash } from 'bcryptjs';
import { Usuario } from './schemas/usuario.schema';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';

@Injectable()
export class UsuariosService {
    constructor(
    @InjectModel(Usuario.name) 
    private readonly modelo: Model<Usuario>
    ) {}

    async buscarPorEmail(email: string) {
        return this.modelo.findOne({ email }).exec();
    }

    async buscarParaLogin(email?: string, username?: string) {
        const filtro = email
            ? { email }
            : { username };

        return this.modelo
            .findOne(filtro)
            .select('+password')
            .exec();
    }

    async crear(datos: CrearUsuarioDto, imagenPerfil = '', imagenPerfilPublicId = '') {
        const email = datos.email.trim().toLowerCase();
        const username = datos.username.trim().toLowerCase();

        const usuarioExistente = await this.modelo.findOne({
            $or: [
                { email },
                { username }
            ],
        }).exec();

        if (usuarioExistente) {
            if (usuarioExistente.email === email) {
                throw new ConflictException('Ya existe un usuario con ese email');
            }

            throw new ConflictException(
                'Ya existe un usuario con ese nombre de usuario');
        }

        const passwordCifrada = await hash(datos.password, 10);

        const usuario = await this.modelo.create({
            nombre: datos.nombre.trim(),
            apellido: datos.apellido.trim(),
            username,
            email,
            imagenPerfil,
            imagenPerfilPublicId,
            password: passwordCifrada,
            fechaNacimiento: new Date(datos.fechaNacimiento),
            descripcion: datos.descripcion?.trim() ?? ''
        });

        const resultado = usuario.toObject();

        return {
            _id: resultado._id,
            nombre: resultado.nombre,
            apellido: resultado.apellido,
            username: resultado.username,
            email: resultado.email,
            fechaNacimiento: resultado.fechaNacimiento,
            descripcion: resultado.descripcion,
            imagenPerfil: resultado.imagenPerfil,
            rol: resultado.rol,
            createdAt: resultado.createdAt,
            updatedAt: resultado.updatedAt
        };
    }
}