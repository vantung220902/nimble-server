import { UserDto } from '@generated';
import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';

export class GetMyProfileQueryResponse
  implements Omit<UserDto, 'hashedPassword' | 'emailVerified' | 'updatedAt'>
{
  @ApiProperty({
    description: 'User Id',
  })
  id: string;

  @ApiProperty({
    description: 'Created At',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'First Name',
  })
  firstName: string;

  @ApiProperty({
    description: 'Last Name',
  })
  lastName: string;

  @ApiProperty({
    description: 'Email',
  })
  email: string;

  @ApiProperty({
    description: 'Status',
  })
  status: $Enums.UserStatus;
}
