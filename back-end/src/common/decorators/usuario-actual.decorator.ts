import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { Rol } from '../../auth/rol.js';

// Datos que contiene el JWT de tu TP.
export interface UsuarioJwt {
    sub: string;
    email: string;
    nombre: string;
    rol: Rol;
}

// Extrae el usuario autenticado de la request.
// @UsuarioActual()      -> devuelve el usuario completo.
// @UsuarioActual('sub') -> devuelve solo el id del usuario.
export const UsuarioActual = createParamDecorator(
    (campo: keyof UsuarioJwt | undefined, ctx: ExecutionContext) => {
        const req = ctx
            .switchToHttp()
            .getRequest<Request & { user: UsuarioJwt }>();

        return campo ? req.user[campo] : req.user;
    },
);
