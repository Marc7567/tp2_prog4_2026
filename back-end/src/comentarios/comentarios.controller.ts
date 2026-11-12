import { Controller, Get, Param } from '@nestjs/common';
import { ComentariosService } from './comentarios.service.js';

@Controller('comentarios')
export class ComentariosController {
    constructor(
        private readonly comentariosService: ComentariosService,
    ) {}

    @Get('publicacion/:publicacionId')
    listarPorPublicacion(
        @Param('publicacionId') publicacionId: string,
    ) {
        return this.comentariosService.listarPorPublicacion(
            publicacionId,
        );
    }
}
