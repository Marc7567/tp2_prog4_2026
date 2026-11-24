import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Publicacion, PublicacionSchema } from './schemas/publicaciones.schema.js';
import { Usuario, UsuarioSchema } from '../usuarios/schemas/usuario.schema.js';
import { Comentario, ComentarioSchema } from '../comentarios/schemas/comentario.schema.js';
import { PublicacionesController } from './publicaciones.controller.js';
import { PublicacionesService } from './publicaciones.service.js';
import { EstadisticasController } from './estadisticas.controller.js';
import { EstadisticasService } from './estadisticas.service.js';
import { AuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { ImagenesModule } from '../imagenes/imagenes.module.js';
import { UsuariosModule } from '../usuarios/usuarios.module.js';

@Module({
    imports: [
        ImagenesModule,
        UsuariosModule,
        MongooseModule.forFeature([
            { name: Publicacion.name, schema: PublicacionSchema },
            { name: Usuario.name, schema: UsuarioSchema },
            { name: Comentario.name, schema: ComentarioSchema }
        ])
    ],
    controllers: [
        PublicacionesController,
        EstadisticasController
    ],
    providers: [
        PublicacionesService,
        EstadisticasService,
        AuthGuard,
        RolesGuard
    ]
})

export class PublicacionesModule { }
