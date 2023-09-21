import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiHideProperty } from "@nestjs/swagger";
import { Document } from "mongoose";

@Schema({
    versionKey: false,
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform(doc, ret) {
            delete ret._id;
            delete ret.updatedAt;
        },
    },
    toObject: {
        virtuals: true,
        transform(doc, ret) {
            doc.id = ret._id;
        },
    },
})
export class Prodcut extends Document{

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    price: number;

    @Prop({ required: true })
    categoryId : string;

    @Prop({ required: true })
    coverPicture: string;

    @Prop({ default: [] })
    pictures: string[];

    @Prop()
    @ApiHideProperty()
    isFavorite: boolean;
}

export const ProdcutSchema = SchemaFactory.createForClass(Prodcut);