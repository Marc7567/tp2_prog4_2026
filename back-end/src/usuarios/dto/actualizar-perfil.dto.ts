import { Transform } from 'class-transformer';
import { IsDateString, IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class ActualizarPerfilDto {
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    nombre: string;

    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    apellido: string;

    @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
    @IsEmail()
    email: string;

    @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
    @IsString()
    @MinLength(3)
    @MaxLength(30)
    username: string;

    @IsDateString()
    fechaNacimiento: string;

    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsString()
    @MaxLength(300)
    descripcion: string;
}