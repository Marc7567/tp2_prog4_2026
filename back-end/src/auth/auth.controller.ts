import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';

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
}