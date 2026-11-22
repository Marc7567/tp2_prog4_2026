import { IsIn } from 'class-validator';
import { CrearUsuarioDto } from './crear-usuario.dto.js';

export class CrearUsuarioAdminDto extends CrearUsuarioDto {
    @IsIn(['usuario', 'administrador'], {
        message: 'El rol debe ser usuario o administrador',
    })

    rol!: 'usuario' | 'administrador';
}
