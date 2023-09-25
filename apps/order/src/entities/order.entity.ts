import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { OrderStatus } from "../common/order_status";

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
export class Order extends Document {

    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    total: number;

    @Prop({ type: String, enum: OrderStatus, default: OrderStatus.waitingForAdminApproved })
    status: OrderStatus;

    @Prop({ required: true })
    products: Array<Object>;

    @Prop({ required: true })
    address: string;

    @Prop({ required: true })
    phone: string;

    @Prop({ required: true })
    deliveryDate: Date;

    @Prop({ required: true })
    deliveryTime: string;

    @Prop({ default: '' })
    notes: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

