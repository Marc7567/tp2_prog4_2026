import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Express } from 'express';
import { UsuariosService } from './usuarios.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ImagenesService, MAX_IMAGEN_BYTES } from '../imagenes/imagenes.service';
import { ImagenesInterceptor } from '../imagenes/imagenes.interceptor';

@Controller('usuarios')
export class UsuariosController {
    constructor(
        private readonly usuariosService: UsuariosService,
        private readonly imagenesService: ImagenesService
    ) {}

    @Post('registro')
    @UseInterceptors(
        ImagenesInterceptor,
        FileInterceptor('imagenPerfil', {
            storage: memoryStorage(),
            limits: {
                fileSize: MAX_IMAGEN_BYTES,
                files: 1,
                fields: 7,
                parts: 8,
                fieldSize: 4096,
                fieldNameSize: 100,
            },
        }),
    )

    async crear(@Body() datos: CrearUsuarioDto, @UploadedFile() archivo?: Express.Multer.File) {
        // Se permite registrar un usuario sin imagen.
        if (!archivo) {
            return this.usuariosService.crear(datos);
        }

        // Validar y convertir la imagen.
        const buffer = await this.imagenesService.normalizar(archivo);

        // Subir a Cloudinary.
        const subida = await this.imagenesService.subir(
            buffer,
            'red-social/perfiles'
        );

        try {
            // Guardar URL e identificador en MongoDB.
            return await this.usuariosService.crear(
                datos,
                subida.url,
                subida.publicId
            );
        } catch (error) {
            // Si falla MongoDB, intentara limpiar Cloudinary.
            await this.imagenesService.eliminar(subida.publicId);
            throw error;
        }
    }
}