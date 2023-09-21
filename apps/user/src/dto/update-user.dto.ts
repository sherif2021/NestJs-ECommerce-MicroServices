import { IsNotEmpty, IsOptional, IsPhoneNumber, MaxLength } from "class-validator";

export class UpdateUserDto {

    @IsOptional()
    @IsNotEmpty()
    @MaxLength(32)
    name?: string;

    @IsOptional()
    @IsPhoneNumber()
    phone?: string;

    @IsOptional()
    @IsNotEmpty()
    picture?: string;
}