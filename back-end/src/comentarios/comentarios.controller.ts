import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { ComentariosService } from './comentarios.service.js';
import { AuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CrearComentarioDto } from './dto/crear-comentario.dto.js';
import { EditarComentarioDto } from './dto/editar-comentario.dto.js';

interface RequestAutenticado extends Request {
    user: { sub: string };
}

@Controller('comentarios')
@UseGuards(AuthGuard)
export class ComentariosController {
    constructor(private readonly comentariosService: ComentariosService) {}

    @Get('publicacion/:publicacionId')
    listarPorPublicacion(
        @Param('publicacionId') publicacionId: string,
        @Query('offset') offset = '0',
        @Query('limit') limit = '5',
    ) {
        return this.comentariosService.listarPorPublicacion(
            publicacionId, Number(offset), Number(limit),
        );
    }

    @Post('publicacion/:publicacionId')
    crear(
        @Param('publicacionId') publicacionId: string,
        @Body() datos: CrearComentarioDto,
        @Req() request: RequestAutenticado,
    ) {
        return this.comentariosService.crear(publicacionId, request.user.sub, datos.mensaje);
    }

    @Put(':id')
    editar(
        @Param('id') id: string,
        @Body() datos: EditarComentarioDto,
        @Req() request: RequestAutenticado,
    ) {
        return this.comentariosService.editar(id, request.user.sub, datos.mensaje);
    }
}
