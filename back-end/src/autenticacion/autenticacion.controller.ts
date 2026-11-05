import { Body, Controller, Post } from '@nestjs/common';
import { AutenticacionService } from './autenticacion.service';
import { LoginDto } from './dto/login.dto';

@Controller()
export class AutenticacionController {
    constructor(
        private readonly autenticacionService: AutenticacionService,
    ) {}

    @Post('login')
    async login(@Body() datos: LoginDto) {
        return this.autenticacionService.login(
            datos.email,
            datos.username,
            datos.password
        );
    }
}