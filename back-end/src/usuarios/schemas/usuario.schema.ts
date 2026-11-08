import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

// Definimos los campos del usuario y 
// agrega las fechas de creacion y actualizacion.
@Schema({ timestamps: true })
export class Usuario {
    // required: true: campo obligatorio
    // trim: true: elimina espacios en blanco al inicio y al final
    // unique: true: valor unico en la base de datos
    @Prop({ required: true, trim: true })
    nombre!: string;

    @Prop({ required: true, trim: true })
    apellido!: string;

    // 
    @Prop({
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    })
    username!: string;

    @Prop({
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    })
    email!: string;

    @Prop({ required: true, select: false })
    password!: string;

    @Prop({ required: true })
    fechaNacimiento!: Date;

    @Prop({ default: '', trim: true })
    descripcion!: string;

    @Prop({ default: '' })
    imagenPerfil!: string;

    @Prop({ default: '', select: false })
    imagenPerfilPublicId!: string;

    @Prop({ enum: ['usuario', 'administrador'], default: 'usuario' })
    rol!: string;

    createdAt!: Date;
    updatedAt!: Date;
}

export type UsuarioDocument = HydratedDocument<Usuario>;
export const UsuarioSchema = SchemaFactory.createForClass(Usuario);