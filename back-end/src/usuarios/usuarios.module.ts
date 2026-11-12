import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Usuario, UsuarioSchema } from './schemas/usuario.schema.js';
import { UsuariosService } from './usuarios.service.js';
import { UsuariosController } from './usuarios.controller.js';
import { ImagenesModule } from '../imagenes/imagenes.module.js';
import { PerfilController } from './perfil.controller.js';
import { PerfilService } from './perfil.service.js';
import { AuthGuard } from '../auth/guards/jwt-auth.guard.js';

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
export class UsuariosModule {}
