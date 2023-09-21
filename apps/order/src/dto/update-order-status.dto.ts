import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { OrderStatus } from "../common/order_status";

export class UpdateOrderStatusDto {

    @IsString()
    @IsNotEmpty()
    orderId: string;

    @IsEnum(OrderStatus)
    @IsNotEmpty()
    status: OrderStatus;
}