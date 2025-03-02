import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { trim } from '@common/utils';
import { AuthenticationValidationConstraint } from '@modules/authentication/authentication.enum';

export class SignInRequestBody {
  @ApiProperty({
    description: 'Email',
    example: 'example@gmail.com',
  })
  @IsEmail({}, { message: 'Email is invalid' })
  @MaxLength(AuthenticationValidationConstraint.EMAIL_MAX_LENGTH, {
    message: 'Email must not exceed 320 characters',
  })
  email: string;

  @ApiProperty({
    description: 'Password',
    example: 'password',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MaxLength(AuthenticationValidationConstraint.PASSWORD_MAX_LENGTH, {
    message: 'Password must not exceed 100 characters',
  })
  @MinLength(AuthenticationValidationConstraint.PASSWORD_MIM_LENGTH, {
    message: 'Password must be at least 8 characters',
  })
  @Matches(/[A-Z]/, {
    message: 'Password must contain uppercase letters',
  })
  @Matches(/[a-z]/, {
    message: 'Password must contain lowercase letters',
  })
  @Matches(/[0-9]/, { message: 'Password must contain numbers' })
  @Matches(/[^A-Za-z0-9]/, {
    message: 'Password must contain at least one special character',
  })
  @Transform(trim)
  password: string;
}
