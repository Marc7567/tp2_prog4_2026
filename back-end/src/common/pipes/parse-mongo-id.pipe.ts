import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isObjectIdOrHexString } from 'mongoose';

// Valida que el parametro sea un ObjectId de MongoDB.
@Injectable()
export class ParseMongoIdPipe implements PipeTransform<string, string> {
    transform(valor: string, metadata: ArgumentMetadata): string {
        if (!isObjectIdOrHexString(valor)) {
            throw new BadRequestException(
                `El parametro "${metadata.data ?? 'id'}" no es un ID valido`,
            );
        }

        return valor;
    }
}
