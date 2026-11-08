import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly usuariosService: UsuariosService,
        private readonly jwtService: JwtService
    ) { }

    async login(
        email: string | undefined,
        username: string | undefined,
        password: string
    ) {
        // Exige un unico identificador: email o username.
        if (Boolean(email) === Boolean(username)) {
            throw new BadRequestException('Debes enviar email o username');
        }

        const usuario = await this.usuariosService.buscarParaLogin(
            email?.trim().toLowerCase(),
            username?.trim().toLowerCase()
        );

        if (!usuario) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        // Compara la contrasena recibida con el hash almacenado.
        const passwordValida = await compare(
            password,
            usuario.password,
        );

        if (!passwordValida) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        // Datos que se guardan dentro del JWT.
        const payload = {
            sub: usuario._id.toString(),
            email: usuario.email,
            nombre: usuario.nombre,
            rol: usuario.rol,
        };

        const accessToken = await this.jwtService.signAsync(payload);
        const resultado = usuario.toObject();

        // Devuelve el token y los datos publicos del usuario.
        return {
            access_token: accessToken,
            usuario: {
                id: usuario._id.toString(),
                nombre: resultado.nombre,
                apellido: resultado.apellido,
                username: resultado.username,
                email: resultado.email,
                fechaNacimiento: resultado.fechaNacimiento,
                descripcion: resultado.descripcion,
                imagenPerfil: resultado.imagenPerfil,
                rol: resultado.rol,
                createdAt: resultado.createdAt,
                updatedAt: resultado.updatedAt,
            },
        };
    }
}