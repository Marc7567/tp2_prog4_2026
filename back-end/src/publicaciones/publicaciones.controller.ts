import { BadRequestException, Body, Controller, Get, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Express, Request } from 'express';
import { PublicacionesService } from './publicaciones.service';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { AuthGuard } from '../guards/auth/auth.guard';
import { ImagenesService, MAX_IMAGEN_BYTES } from '../imagenes/imagenes.service';
import { ImagenesInterceptor } from '../imagenes/imagenes.interceptor';

interface RequestAutenticado extends Request {
    user: {
        sub: string;
    };
}

@Controller('publicaciones')
@UseGuards(AuthGuard)
export class PublicacionesController {
    constructor(
        private readonly publicacionesService: PublicacionesService,
        private readonly imagenesService: ImagenesService,
    ) {}

    @Post()
    @UseInterceptors(
        ImagenesInterceptor,
        FileInterceptor('imagen', {
            storage: memoryStorage(),
            limits: {
                fileSize: MAX_IMAGEN_BYTES,
                files: 1,
                fields: 3,
                parts: 4,
                fieldSize: 4096,
                fieldNameSize: 100,
            },
        }),
    )
    async crear(
        @Body() datos: CrearPublicacionDto,
        @Req() request: RequestAutenticado,
        @UploadedFile() archivo?: Express.Multer.File,
    ) {
        // Si no hay archivo, se conserva el funcionamiento JSON anterior.
        if (!archivo) {
            return this.publicacionesService.crear(
                datos,
                request.user.sub,
            );
        }

        // No aceptar una URL y un archivo al mismo tiempo.
        if (datos.imagen?.trim()) {
            throw new BadRequestException(
                'Envía la imagen como archivo o como URL, no ambas',
            );
        }

        const buffer = await this.imagenesService.normalizar(archivo);

        const subida = await this.imagenesService.subir(
            buffer,
            'red-social/publicaciones',
        );

        try {
            return await this.publicacionesService.crear(
                {
                    ...datos,
                    imagen: subida.url,
                },
                request.user.sub,
                subida.publicId,
            );
        } catch (error) {
            await this.imagenesService.eliminar(subida.publicId);
            throw error;
        }
    }

    @Get()
    listar() {
        return this.publicacionesService.listar();
    }
}