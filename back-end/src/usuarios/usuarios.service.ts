import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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
        const filtro = email ? { email } : { username };

        return this.modelo
            .findOne(filtro)
            .select('+password')
            .exec();
    }

    // Valida duplicados, cifra la contrasena y crea el usuario.
    async crear(
        datos: CrearUsuarioDto & { rol?: 'usuario' | 'administrador' },
        imagenPerfil = '',
        imagenPerfilPublicId = ''
    ) {
        const email = datos.email.trim().toLowerCase();
        const username = datos.username.trim().toLowerCase();
        const rol = datos.rol ?? 'usuario';

        // Comprueba duplicados sin importar el rol.
        const usuarioExistente = await this.modelo.findOne({
            $or: [{ email }, { username }]
        }).exec();

        if (usuarioExistente) {
            if (usuarioExistente.email === email) {
                throw new ConflictException('Ya existe un usuario con ese email');
            }

            throw new ConflictException('Ya existe un usuario con ese nombre de usuario');
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
            descripcion: datos.descripcion?.trim() ?? '',
            rol
        });

        // obtenemos los datos de usuario como objeto
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

    async buscarPorId(id: string) {
        return this.modelo.findById(id).exec();
    }
    
    async deshabilitarUsuario(id: string) {
        return this.cambiarHabilitacion(id, false);
    }

    async habilitarUsuario(id: string) {
        return this.cambiarHabilitacion(id, true);
    }

    // Lista usuarios sin exponer datos privados.
    async listarTodos() {
        return this.modelo
            .find()
            .select('_id nombre apellido username email fechaNacimiento descripcion imagenPerfil rol habilitado createdAt updatedAt')
            .sort({ createdAt: -1 })
            .exec();
    }

    // Habilita o deshabilita una cuenta.
    async cambiarHabilitacion(id: string, habilitado: boolean) {
        const usuario = await this.modelo
            .findByIdAndUpdate(
                id,
                { $set: { habilitado } },
                { new: true, runValidators: true },
            )
            .select('_id nombre apellido username email imagenPerfil rol habilitado createdAt updatedAt')
            .exec();

        if (!usuario) {
            throw new NotFoundException('No existe un Usuario con ese ID');
        }

        return usuario;
    }
}
