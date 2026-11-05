import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CrearPublicacionDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    titulo!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    mensaje!: string;

    @IsOptional()
    @IsString()
    imagen?: string;
}