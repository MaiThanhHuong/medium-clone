import {
  IsEmail,
  IsOptional,
  IsString,
  ValidateIf,
  IsNotEmpty,
  Matches,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address.' })
  email?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password?: string;

  @ValidateIf((o) => o.password !== undefined && o.password !== '')
  @IsNotEmpty({
    message: 'Password confirmation is required when changing the password.',
  })
  @Matches(/password/, { message: 'Passwords do not match.' })
  passwordConfirmation?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  image?: string;
}
