import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../../usuarios/usuarios.service.js';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usuariosService: UsuariosService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authorization = request.headers.authorization;

        if (!authorization?.startsWith('Bearer ')) {
            throw new UnauthorizedException('Token no proporcionado');
        }

        const token = authorization.slice(7);

        try {
            const payload = await this.jwtService.verifyAsync(token);

            if (typeof payload.sub !== 'string') {
                throw new UnauthorizedException('Token invalido');
            }

            const usuario = await this.usuariosService.buscarPorId(
                payload.sub
            );

            if (!usuario || usuario.habilitado === false) {
                throw new UnauthorizedException('Tu cuenta esta deshabilitada o ya no existe');
            }

            request.user = {
                sub: usuario._id.toString(),
                email: usuario.email,
                nombre: usuario.nombre,
                rol: usuario.rol,
            };

            return true;
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }

            throw new UnauthorizedException('Token invalido o vencido');
        }
    }
}
