import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { AuthGuard } from './guards/jwt-auth.guard.js';

interface UsuarioAutenticado {
    sub: string;
    email: string;
    nombre: string;
    rol: 'usuario' | 'administrador';
}

interface RequestAutenticado extends Request {
    user: UsuarioAutenticado;
}

// Definimos las rutas relacionadas con la autenticacion.
@Controller()
export class AuthController {
    constructor(
        private readonly autenticacionService: AuthService,
    ) {}

    // Recibe las credenciales y devuelve el token JWT junto con los datos del usuario.
    @Post('login')
    async login(@Body() datos: LoginDto) {
        return this.autenticacionService.login(
            datos.email,
            datos.username,
            datos.password
        );
    }

    // Validamos el JWT y devolvemos los datos.
    @Post('auth/autorizar')
    @UseGuards(AuthGuard)
    autorizar(@Req() request: RequestAutenticado) {
        return {
            autorizado: true,
            usuario: {
                id: request.user.sub,
                email: request.user.email,
                nombre: request.user.nombre,
                rol: request.user.rol,
            },
        };
    }

    // Solicitud para renovar token vencido
    @Post('auth/refrescar')
    @UseGuards(AuthGuard)
    async renovar(@Req() request: RequestAutenticado) {
        const { sub, email, nombre, rol } = request.user;

        return this.autenticacionService.renovarToken({
            sub, email, nombre, rol 
        });
    }
}