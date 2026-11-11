import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument, Types } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Comentario {
    @Prop({ required: true, trim: true, maxlength: 1000 })
    mensaje!: string;

    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'Usuario',
        required: true,
    })
    autor!: Types.ObjectId;

    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'Publicacion',
        required: true,
        index: true,
    })
    publicacion!: Types.ObjectId;

    createdAt!: Date;
    updatedAt!: Date;
}

export type ComentarioDocument = HydratedDocument<Comentario>;
export const ComentarioSchema = SchemaFactory.createForClass(Comentario);
