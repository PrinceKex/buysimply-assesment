import { IsEmail, IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  first_name: string;

  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  last_name: string;

  @IsOptional()
  role_id: string;
}
