import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { AuthGuard } from './guards/jwt-auth.guard.js';

@Module({
    imports: [
        ConfigModule,
        JwtModule.registerAsync({
            global: true,
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const secret = configService.get<string>('JWT_SECRET');

                if (!secret) {
                    throw new Error('Falta configurar JWT_SECRET');
                }

                return {
                    secret,
                    signOptions: {
                        // expiresIn: '15m'
                        expiresIn: '3m' //expira en 5 minutos
                    }
                };
            }
        }),
        UsuariosModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, AuthGuard]
})

export class AuthModule {}