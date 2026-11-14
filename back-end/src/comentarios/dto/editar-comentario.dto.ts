import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class EditarComentarioDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(300)
    mensaje!: string;
}
