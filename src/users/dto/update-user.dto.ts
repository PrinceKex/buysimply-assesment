import { IsEmail, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @MinLength(6)
  @MaxLength(50)
  @IsOptional()
  password?: string;

  @MinLength(2)
  @MaxLength(50)
  @IsOptional()
  first_name?: string;

  @MinLength(2)
  @MaxLength(50)
  @IsOptional()
  last_name?: string;

  @IsOptional()
  role_id?: string;

  @IsOptional()
  is_active?: boolean;
}
