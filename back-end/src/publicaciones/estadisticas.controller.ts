import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service.js';
import { AuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';

@Controller('publicaciones/estadisticas')
@UseGuards(AuthGuard, RolesGuard)
@Roles('administrador')
export class EstadisticasController {
    constructor(
        private readonly estadisticasService: EstadisticasService,
    ) {}

    @Get('publicaciones-usuario')
    publicacionesPorUsuario(
        @Query('desde') desde: string,
        @Query('hasta') hasta: string
    ) {
        return this.estadisticasService.publicacionesPorUsuario(
            desde, hasta
        );
    }

    @Get('comentarios')
    comentariosPorDia(
        @Query('desde') desde: string,
        @Query('hasta') hasta: string
    ) {
        return this.estadisticasService.comentariosPorDia(
            desde, hasta
        );
    }

    @Get('comentarios-publicacion')
    comentariosPorPublicacion(
        @Query('desde') desde: string,
        @Query('hasta') hasta: string
    ) {
        return this.estadisticasService.comentariosPorPublicacion(
            desde, hasta
        );
    }
}
