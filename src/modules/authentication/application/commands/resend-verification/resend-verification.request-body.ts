import { AuthenticationValidationConstraint } from '@modules/authentication/authentication.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength } from 'class-validator';

export class ResendVerificationRequestBody {
  @ApiProperty({
    description: 'Email',
    example: 'example@gmail.com',
  })
  @IsEmail({}, { message: 'Email is invalid' })
  @MaxLength(AuthenticationValidationConstraint.EMAIL_MAX_LENGTH, {
    message: 'Email must not exceed 320 characters',
  })
  email: string;
}
