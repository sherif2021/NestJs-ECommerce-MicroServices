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
export class Cart extends Document {

    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    productId: string;

    @Prop({ default: 1 })
    quantity: number;

    @Prop({ type: Object })
    product: Object;
}

export const CartSchema = SchemaFactory.createForClass(Cart);