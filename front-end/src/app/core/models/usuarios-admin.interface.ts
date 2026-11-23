export interface UsuarioAdmin {
    _id: string;
    nombre: string;
    apellido: string;
    username: string;
    email: string;
    fechaNacimiento: string;
    descripcion: string;
    imagenPerfil: string;
    rol: 'usuario' | 'administrador';
    habilitado: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CrearUsuarioAdmin {
    nombre: string;
    apellido: string;
    username: string;
    email: string;
    password: string;
    fechaNacimiento: string;
    descripcion: string;
    rol: 'usuario' | 'administrador';
}
