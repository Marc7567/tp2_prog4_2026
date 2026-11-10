import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument, Types } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

// Define la estructura de las publicaciones y sus fechas automaticas.
@Schema({ timestamps: true })
export class Publicacion {
    @Prop({ required: true, trim: true, maxlength: 100 })
    titulo!: string;

    @Prop({ required: true, trim: true, maxlength: 2000 })
    mensaje!: string;

    // URL de la imagen, si la publicacion tiene una.
    @Prop({ default: '' })
    imagen!: string;

    // Identificador interno de Cloudinary, excluido de consultas normales.
    @Prop({ default: '', select: false })
    imagenPublicId!: string;

    // Relaciona la publicacion con el usuario que la creo.
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'Usuario',
        required: true,
    })
    autor!: Types.ObjectId;

    // Indica si la publicacion fue eliminada logicamente.
    @Prop({ default: false, index: true })
    eliminada!: boolean;

    // Usuarios que dieron me gusta a la publicacion.
    @Prop({
        type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Usuario' }],
        default: [],
    })
    meGusta!: Types.ObjectId[];

    createdAt!: Date;
    updatedAt!: Date;
}

// Tipo y esquema que utiliza Mongoose.
export type PublicacionDocument = HydratedDocument<Publicacion>;
export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
