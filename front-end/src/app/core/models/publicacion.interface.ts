export interface Publicacion {
    _id: string;
    title: string;
    message: string;
    imagen: string;
    autor: AutorPublicacion;
    createdAt: string;
    updatedAt: string;
}

export interface AutorPublicacion {
    nombre: string;
    apellido: string;
    username: string;
    imagenPerfil: string;
}