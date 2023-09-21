import { IsNotEmpty, MinLength, MaxLength } from "class-validator";

export class UpdatePasswordDto {

    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(20)
    oldPassword: string;


    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(20)
    newPassword: string;
}