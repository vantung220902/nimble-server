import { UserStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    required: false,
  })
  id: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
  })
  createdAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
  })
  updatedAt: Date;
  @ApiProperty({
    required: false,
  })
  firstName: string;
  @ApiProperty({
    required: false,
  })
  lastName: string;
  @ApiProperty({
    required: false,
  })
  email: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true,
  })
  emailVerified: Date | null;
  @ApiProperty({
    required: false,
  })
  hashedPassword: string;
  @ApiProperty({
    enum: UserStatus,
    required: false,
  })
  status: UserStatus;
}
