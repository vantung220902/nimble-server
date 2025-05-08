import {
  AuthenticationValidationConstraint,
  VERIFICATION_CODE_LENGTH,
} from '@modules/authentication/authentication.enum';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class VerifyUserRequestBody {
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
    description: 'Verification code',
    example: '123456',
  })
  @IsString({ message: 'Code must be a string' })
  @IsNotEmpty({ message: 'Code is required' })
  @Length(VERIFICATION_CODE_LENGTH, VERIFICATION_CODE_LENGTH, {
    message: 'Verification code must be 6-digit',
  })
  code: string;
}
