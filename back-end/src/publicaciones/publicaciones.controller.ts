import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Express, Request } from 'express';
import { PublicacionesService } from './publicaciones.service';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { ImagenesService, MAX_IMAGEN_BYTES } from '../imagenes/imagenes.service';
import { ImagenesInterceptor } from '../imagenes/imagenes.interceptor';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';

interface RequestAutenticado extends Request {
    user: { sub: string };
}

@Controller('publicaciones')
export class PublicacionesController {
    constructor(
        private readonly publicacionesService: PublicacionesService,
        private readonly imagenesService: ImagenesService,
        private readonly jwtService: JwtService
    ) { }

    @Post()
    @UseGuards(AuthGuard)
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
                fieldNameSize: 100
            }
        })
    )
    async crear(
        @Body() datos: CrearPublicacionDto,
        @Req() request: RequestAutenticado,
        @UploadedFile() archivo?: Express.Multer.File
    ) {
        if (!archivo) {
            return this.publicacionesService.crear(datos, request.user.sub);
        }

        if (datos.imagen?.trim()) {
            throw new BadRequestException('Envía la imagen como archivo o como URL');
        }

        const buffer = await this.imagenesService.normalizar(archivo);
        const subida = await this.imagenesService.subir(buffer, 'red-social/publicaciones');

        try {
            return await this.publicacionesService.crear(
                { ...datos, imagen: subida.url },
                request.user.sub,
                subida.publicId
            );
        } catch (error) {
            await this.imagenesService.eliminar(subida.publicId);
            throw error;
        }
    }

    @Get()
    async listar(
        @Req() request: Request,
        @Query('orden') orden = 'fecha',
        @Query('usuarioId') usuarioId?: string,
        @Query('offset') offsetTexto = '0',
        @Query('limit') limitTexto = '5',
    ) {
        let usuarioActualId = '000000000000000000000000';
        const authorization = request.headers.authorization;

        if (authorization?.startsWith('Bearer ')) {
            try {
                const payload = await this.jwtService.verifyAsync(
                    authorization.slice(7),
                );

                if (typeof payload.sub === 'string' &&
                    Types.ObjectId.isValid(payload.sub)) {
                    usuarioActualId = payload.sub;
                }
            } catch {
                // El listado sigue siendo publico aunque el token no sea valido.
            }
        }

        return this.publicacionesService.listar(
            usuarioActualId,
            orden,
            usuarioId,
            Number(offsetTexto),
            Number(limitTexto),
        );
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    eliminar(@Param('id') id: string, @Req() request: RequestAutenticado) {
        return this.publicacionesService.eliminar(id, request.user.sub);
    }

    @Post(':id/me-gusta')
    @UseGuards(AuthGuard)
    darMeGusta(@Param('id') id: string, @Req() request: RequestAutenticado) {
        return this.publicacionesService.darMeGusta(id, request.user.sub);
    }

    @Delete(':id/me-gusta')
    @UseGuards(AuthGuard)
    quitarMeGusta(@Param('id') id: string, @Req() request: RequestAutenticado) {
        return this.publicacionesService.quitarMeGusta(id, request.user.sub);
    }
}
