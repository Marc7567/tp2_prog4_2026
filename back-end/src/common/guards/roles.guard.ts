import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { Rol } from '../../auth/rol.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import type { UsuarioJwt } from '../decorators/usuario-actual.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(ctx: ExecutionContext): boolean {
        // Busca @Roles() primero en el metodo y luego en el controlador.
        const permitidos = this.reflector.getAllAndOverride<Rol[] | undefined>(
            ROLES_KEY,
            [ctx.getHandler(), ctx.getClass()],
        );

        // Sin @Roles(), solo se exige estar autenticado.
        if (!permitidos || permitidos.length === 0) {
            return true;
        }

        const { user } = ctx
            .switchToHttp()
            .getRequest<Request & { user?: UsuarioJwt }>();

        if (!user || !permitidos.includes(user.rol)) {
            throw new ForbiddenException(
                'No tienes permisos para realizar esta accion',
            );
        }

        return true;
    }
}
