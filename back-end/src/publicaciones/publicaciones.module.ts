import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Publicacion, PublicacionSchema } from './schemas/publicaciones.schema';
import { PublicacionesController } from './publicaciones.controller';
import { PublicacionesService } from './publicaciones.service';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { ImagenesModule } from '../imagenes/imagenes.module';

@Module({
    imports: [
        ImagenesModule,
        MongooseModule.forFeature([{name: Publicacion.name, schema: PublicacionSchema}]),
    ],
    controllers: [PublicacionesController],
    providers: [PublicacionesService, AuthGuard],
})
export class PublicacionesModule {}