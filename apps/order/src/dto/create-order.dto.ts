import { Transform } from "class-transformer";
import { IsDate, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, MinDate } from "class-validator";

export class CreateOrderDto {

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsNotEmpty()
    @IsPhoneNumber()
    phone: string;

    @IsNotEmpty()
    @IsDate()
    @MinDate(new Date())
    @Transform( ({ value }) => new Date(value))
    deliveryDate: Date;

    @IsString()
    @IsNotEmpty()
    deliveryTime: string;

    @IsOptional()
    @IsString()
    notes?: string;
}