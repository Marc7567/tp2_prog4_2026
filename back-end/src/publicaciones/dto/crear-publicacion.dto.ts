import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CrearPublicacionDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    titulo!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(300)
    mensaje!: string;

    // imagen es opcional y puede recibirse como URL.
    @IsOptional()
    @IsString()
    imagen?: string;
}