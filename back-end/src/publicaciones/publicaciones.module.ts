import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Publicacion, PublicacionSchema } from './schemas/publicaciones.schema';
import { Usuario, UsuarioSchema } from '../usuarios/schemas/usuario.schema';
import { PublicacionesController } from './publicaciones.controller';
import { PublicacionesService } from './publicaciones.service';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { ImagenesModule } from '../imagenes/imagenes.module';

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
