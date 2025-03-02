import { IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName?: string;
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  email?: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  emailVerified?: Date | null;
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  hashedPassword?: string;
}
