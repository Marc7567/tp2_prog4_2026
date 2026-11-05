import { Module } from '@nestjs/common';
import { ImagenesService } from './imagenes.service';
import { ImagenesInterceptor } from './imagenes.interceptor';

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