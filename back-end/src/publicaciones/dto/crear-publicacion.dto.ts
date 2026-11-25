import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CrearPublicacionDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(40)
    titulo!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(300)
    mensaje!: string;

    // Imagen opcional que puede recibirse como URL.
    @IsOptional()
    @IsString()
    imagen?: string;
}