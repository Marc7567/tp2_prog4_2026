import { CallHandler, ExecutionContext, Injectable, NestInterceptor, ServiceUnavailableException } from '@nestjs/common';
import { finalize } from 'rxjs';

@Injectable()
export class ImagenesInterceptor implements NestInterceptor {
    private activas = 0;

    intercept(_context: ExecutionContext, next: CallHandler) {
        if (this.activas >= 4) {
            throw new ServiceUnavailableException('Demasiadas subidas simultaneas; reintenta mas tarde');
        }

        this.activas++;

        return next.handle().pipe(
            finalize(() => this.activas--),
        );
    }
}
