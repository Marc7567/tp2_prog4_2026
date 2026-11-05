import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Usuario, UsuarioSchema } from './schemas/usuario.schema';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { ImagenesModule } from '../imagenes/imagenes.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
        ImagenesModule
    ],
    controllers: [UsuariosController],
    providers: [UsuariosService],
    exports: [UsuariosService]
})
export class UsuariosModule {}