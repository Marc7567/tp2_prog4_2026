
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            // Obtiene el JWT del encabezado Authorization: Bearer.
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET!,
            ignoreExpiration: false,
            algorithms: ['HS256'],
        });
    }

    // Define los datos del usuario disponibles tras validar el token.
    validate(payload: { sub: string; email: string }) {
        return { sub: payload.sub, email: payload.email };
    }
}
