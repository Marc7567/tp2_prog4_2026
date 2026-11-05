import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument, Types } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Publicacion {
    @Prop({ required: true, trim: true, maxlength: 100 })
    titulo!: string;

    @Prop({ required: true, trim: true, maxlength: 2000 })
    mensaje!: string;

    @Prop({ default: '' })
    imagen!: string;

    @Prop({ default: '', select: false })
    imagenPublicId!: string;

    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'Usuario',
        required: true,
    })
    autor!: Types.ObjectId;

    createdAt!: Date;
    updatedAt!: Date;
}

export type PublicacionDocument = HydratedDocument<Publicacion>;
export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
