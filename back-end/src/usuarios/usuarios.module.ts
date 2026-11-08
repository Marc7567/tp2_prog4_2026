import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Usuario, UsuarioSchema } from './schemas/usuario.schema';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { ImagenesModule } from '../imagenes/imagenes.module';
import { PerfilController } from './perfil.controller';
import { PerfilService } from './perfil.service';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
    imports: [
        // Registra el esquema Usuario para utilizarlo con MongoDB.
        MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
        ImagenesModule
    ],
    controllers: [
        UsuariosController,
        PerfilController
    ],
    providers: [
        UsuariosService,
        PerfilService,
        AuthGuard
    ],
    // Permite que otros modulos utilicen UsuariosService.
    exports: [UsuariosService]
})
export class UsuariosModule { }
