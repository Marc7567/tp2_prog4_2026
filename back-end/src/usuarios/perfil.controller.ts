import { Body, Controller, Get, Patch, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Express, Request } from 'express';
import { AuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ImagenesService, MAX_IMAGEN_BYTES } from '../imagenes/imagenes.service.js';
import { ImagenesInterceptor } from '../imagenes/imagenes.interceptor.js';
import { PerfilService } from './perfil.service.js';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto.js';

interface RequestAutenticado extends Request {
    user: { sub: string; };
}

@Controller('usuarios/me')
@UseGuards(AuthGuard)
export class PerfilController {
    constructor(
        private readonly perfilService: PerfilService,
        private readonly imagenesService: ImagenesService,
    ) {}

    @Get()
    obtener(@Req() request: RequestAutenticado) {
        return this.perfilService.obtener(request.user.sub);
    }

    @Patch()
    @UseInterceptors(
        ImagenesInterceptor,
        FileInterceptor('imagenPerfil', {
            storage: memoryStorage(),
            limits: {
                fileSize: MAX_IMAGEN_BYTES,
                files: 1,
                fields: 6,
                parts: 7,
                fieldSize: 4096,
                fieldNameSize: 100
            }
        })
    )

    async actualizar(
        @Req() request: RequestAutenticado,
        @Body() datos: ActualizarPerfilDto,
        @UploadedFile() archivo?: Express.Multer.File,
    ) {
        if (!archivo) {
            return this.perfilService.actualizar(
                request.user.sub,
                datos 
            );
        }

        const buffer = await this.imagenesService.normalizar(archivo);

        const subida = await this.imagenesService.subir(
            buffer, 'red-social/perfiles'
        );

        try {
            return await this.perfilService.actualizar(
                request.user.sub,
                datos,
                subida.url
            );
        } catch (error) {
            await this.imagenesService.eliminar(subida.publicId);
            throw error;
        }
    }
}