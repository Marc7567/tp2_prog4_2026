import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
    imports: [
        // Configura JWT con una clave secreta y una duracion de 24 horas.
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET,
            signOptions: {
                expiresIn: '1d',
            },
        }),
        UsuariosModule
    ],
    controllers: [AuthController],
    providers: [AuthService]
})
export class AuthModule {}