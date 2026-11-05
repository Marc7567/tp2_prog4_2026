import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { AutenticacionService } from './autenticacion.service';
import { AutenticacionController } from './autenticacion.controller';

@Module({
    imports: [
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET,
            signOptions: {
                expiresIn: '1d',
            },
        }),
        UsuariosModule
    ],
    controllers: [AutenticacionController],
    providers: [AutenticacionService]
})

export class AutenticacionModule {}