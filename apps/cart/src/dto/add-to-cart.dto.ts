import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class AddToCartDto {

    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    @IsInt()
    quantity?: number;
}