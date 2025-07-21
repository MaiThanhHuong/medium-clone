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
  @IsEmail({}, { message: 'Email must be a valid email address.' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @IsOptional()
  password?: string;

  @ValidateIf((o) => o.password !== undefined && o.password !== '')
  @IsNotEmpty({
    message: 'Password confirmation is required when changing the password.',
  })
  @Matches(/password/, { message: 'Passwords do not match.' })
  passwordConfirmation?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  image?: string;
}
