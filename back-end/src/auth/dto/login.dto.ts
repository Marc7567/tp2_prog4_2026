import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
    // Se puede enviar email o username como identificador.
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    username?: string;

    // La contrasena es obligatoria y debe tener al menos 8 caracteres.
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password!: string;
}
