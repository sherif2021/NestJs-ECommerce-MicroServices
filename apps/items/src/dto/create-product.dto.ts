import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, isPositive } from "class-validator";

export class CreateProductDto {

    @IsNotEmpty()
    @IsString()
    @MaxLength(32)
    name: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    price: number;

    @IsNotEmpty()
    @IsMongoId()
    categoryId: string;

    @IsNotEmpty()
    @IsString()
    coverPicture: string;

    @IsOptional()
    @IsArray()
    pictures?: string[];
}