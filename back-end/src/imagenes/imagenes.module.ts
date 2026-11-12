import { Module } from '@nestjs/common';
import { ImagenesService } from './imagenes.service.js';
import { ImagenesInterceptor } from './imagenes.interceptor.js';

@Module({
    providers: [
        ImagenesService,
        ImagenesInterceptor,
    ],
    exports: [
        ImagenesService,
        ImagenesInterceptor,
    ],
})

export class ImagenesModule {}