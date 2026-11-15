
import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Express } from 'express';
import { UsuariosService } from './usuarios.service.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { ImagenesService, MAX_IMAGEN_BYTES } from '../imagenes/imagenes.service.js';
import { ImagenesInterceptor } from '../imagenes/imagenes.interceptor.js';

@Controller('usuarios')
export class UsuariosController {
    constructor(
        private readonly usuariosService: UsuariosService,
        private readonly imagenesService: ImagenesService,
        private readonly jwtService: JwtService
    ) {}

    // Registra al usuario y procesa opcionalmente su imagen de perfil.
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
                fieldNameSize: 100
            }
        })
    )

    async crear(
        @Body() datos: CrearUsuarioDto,
        @UploadedFile() archivo?: Express.Multer.File
    ) {
        let usuario;

        if (!archivo) {
            usuario = await this.usuariosService.crear(datos);
        } else {
            const buffer = await this.imagenesService.normalizar(archivo);
            const subida = await this.imagenesService.subir(
                buffer, 'red-social/perfiles'
            );

            try {
                usuario = await this.usuariosService.crear(
                    datos,
                    subida.url,
                    subida.publicId
                );
            } catch (error) {
                // Limpia la imagen si falla el registro en MongoDB.
                await this.imagenesService.eliminar(subida.publicId);
                throw error;
            }
        }

        const accessToken = await this.jwtService.signAsync({
            sub: usuario._id.toString(),
            email: usuario.email,
            nombre: usuario.nombre,
            rol: usuario.rol,
        });

        return {
            access_token: accessToken,
            usuario,
        };
    }
}
