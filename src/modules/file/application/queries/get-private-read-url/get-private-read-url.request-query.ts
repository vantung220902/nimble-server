import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class GetPrivateReadUrlRequestQuery {
  @ApiProperty({
    description: 'Path of file',
    example:
      'https://user-storage-dev.s3.us-west-2.amazonaws.com/avatars/user-id/keywords.csv',
  })
  @IsUrl()
  filePath: string;
}
