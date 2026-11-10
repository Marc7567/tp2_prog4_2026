export interface Publicacion {
    _id: string;
    titulo: string;
    mensaje: string;
    imagen: string;
    autor: AutorPublicacion;
    cantidadMeGusta: number;
    meGustaUsuario: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AutorPublicacion {
    _id: string;
    nombre: string;
    apellido: string;
    username: string;
    imagenPerfil: string;
}

export interface RespuestaPublicaciones {
    items: Publicacion[];
    total: number;
    offset: number;
    limit: number;
}