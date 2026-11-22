import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'publico';

// Marca una ruta como publica.
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);