import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { hash } from 'bcryptjs';
import { Usuario } from './schemas/usuario.schema.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';

@Injectable()
export class UsuariosService {
    constructor(
        @InjectModel(Usuario.name)
        private readonly modelo: Model<Usuario>
    ) {}

    // Busca un usuario por su email.
    async buscarPorEmail(email: string) {
        return this.modelo.findOne({ email }).exec();
    }

    // Busca por email o username e incluye la contrasena para verificar el login.
    async buscarParaLogin(email?: string, username?: string) {
        const filtro = email
            ? { email }
            : { username };

        return this.modelo
            .findOne(filtro)
            .select('+password')
            .exec();
    }

    // Valida duplicados, cifra la contrasena y crea el usuario.
    async crear(
        datos: CrearUsuarioDto,
        imagenPerfil = '',
        imagenPerfilPublicId = ''
    ) {
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
                throw new ConflictException(
                    'Ya existe un usuario con ese email'
                );
            }

            throw new ConflictException(
                'Ya existe un usuario con ese nombre de usuario'
            );
        }

        // Genera un hash de la contrasena con un factor de costo de 10.
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

        // Devuelve los datos publicos sin exponer la contrasena ni el ID de Cloudinary.
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
