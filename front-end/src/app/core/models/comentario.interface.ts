import { AutorPublicacion } from './publicacion.interface.js';

export interface Comentario {
    _id: string;
    mensaje: string;
    autor: AutorPublicacion;
    publicacion: string;
    createdAt: string;
    updatedAt: string;
}
