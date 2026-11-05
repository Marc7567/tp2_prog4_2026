import { IsDateString, IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength} from 'class-validator';

export class CrearUsuarioDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    nombre!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    apellido!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: 'El nombre de usuario solo puede contener letras, numeros y guion bajo',
    })
    username!: string;

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @MinLength(8)
    @MaxLength(72)
    @Matches(/^(?=.*[A-Z])(?=.*\d).+$/, {
        message: 'La contrasena debe contener al menos una mayuscula y un numero',
    })
    password!: string;

    @IsDateString()
    fechaNacimiento!: string;

    @IsString()
    @MaxLength(300)
    descripcion: string = '';
}
