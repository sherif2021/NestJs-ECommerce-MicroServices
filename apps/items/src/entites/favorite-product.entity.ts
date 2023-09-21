import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
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
export class FavoriteProduct extends Document {

    @Prop({ required: true })
    productId: string;

    @Prop({ required: true })
    userId: string;
}

export const FavoriteProductSchema = SchemaFactory.createForClass(FavoriteProduct);