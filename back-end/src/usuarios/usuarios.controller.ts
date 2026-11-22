import { BadRequestException, Body, Controller, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors, Delete } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Express } from 'express';
import { UsuariosService } from './usuarios.service.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { ImagenesService, MAX_IMAGEN_BYTES } from '../imagenes/imagenes.service.js';
import { ImagenesInterceptor } from '../imagenes/imagenes.interceptor.js';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id.pipe.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { AuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CrearUsuarioAdminDto } from './dto/crear-usuario-admin.dto.js';

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
            usuario
        };
    }

    // Lista todos los usuarios. Solo para administradores.
    @Get('admin')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('administrador')
    listarUsuarios() {
        return this.usuariosService.listarTodos();
    }

    // Cambia el estado de una cuenta. Solo para administradores.
    @Patch('admin/:id/habilitado')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('administrador')
    cambiarHabilitacion(
        @Param('id', ParseMongoIdPipe) id: string,
        @Body() datos: { habilitado?: unknown }
    ) {
        if (typeof datos.habilitado !== 'boolean') {
            throw new BadRequestException('El campo habilitado debe ser true o false');
        }

        return this.usuariosService.cambiarHabilitacion(
            id,
            datos.habilitado
        );
    }

    // Alta administrativa de un usuario.
    @Post('admin')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('administrador')
    crearAdministrativamente(
        @Body() datos: CrearUsuarioAdminDto,
    ) {
        return this.usuariosService.crear(datos);
    }

    // Baja logica de un usuario.
    @Delete('admin/:id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('administrador')
    deshabilitarUsuario(
        @Param('id', ParseMongoIdPipe) id: string,
    ) {
        return this.usuariosService.deshabilitarUsuario(id);
    }

    // Alta logica: rehabilita un usuario deshabilitado.
    @Post('admin/:id/habilitar')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('administrador')
    habilitarUsuario(
        @Param('id', ParseMongoIdPipe) id: string,
    ) {
        return this.usuariosService.habilitarUsuario(id);
    }
}
