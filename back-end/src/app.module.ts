import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';
import { PublicacionesModule } from './publicaciones/publicaciones.module.js';
import { LogsMiddleware } from './middleware/login.middleware.js';
import { ComentariosModule } from './comentarios/comentarios.module.js';

// // Carga las variables de .env antes de configurar los modulos.
// if (existsSync('.env')) loadEnvFile('.env');

// const mongoUri = process.env.MONGODB_URI;

// if (!mongoUri) {
//     throw new Error('Configurá MONGODB_URI en .env con la conexión de MongoDB Atlas',);
// }

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: process.env.VERCEL === '1',
        }),

        MongooseModule.forRoot(process.env.MONGODB_URI ?? ''),
        AuthModule,
        UsuariosModule,
        PublicacionesModule,
        ComentariosModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})

export class AppModule implements NestModule {
    // Registra el middleware de logs para todas las rutas.
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LogsMiddleware).forRoutes('*');
    }
}