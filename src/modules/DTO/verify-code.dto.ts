import { IsEmail, IsString, Length, MinLength } from "class-validator";

export class VerifyCodeDto {
    @IsEmail()
    userEmail: string;
  
    @Length(6, 6)
    code: string;
  
    @IsString()
    userName: string;
  
    @MinLength(6)
    password: string;
  }
  