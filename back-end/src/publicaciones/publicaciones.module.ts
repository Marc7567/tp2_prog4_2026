import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Publicacion, PublicacionSchema } from './schemas/publicaciones.schema.js';
import { Usuario, UsuarioSchema } from '../usuarios/schemas/usuario.schema.js';
import { PublicacionesController } from './publicaciones.controller.js';
import { PublicacionesService } from './publicaciones.service.js';
import { AuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ImagenesModule } from '../imagenes/imagenes.module.js';

@Module({
    imports: [
        ImagenesModule,
        MongooseModule.forFeature([
            { name: Publicacion.name, schema: PublicacionSchema },
            { name: Usuario.name, schema: UsuarioSchema }
        ])
    ],
    controllers: [PublicacionesController],
    providers: [PublicacionesService, AuthGuard]
})

export class PublicacionesModule {}
