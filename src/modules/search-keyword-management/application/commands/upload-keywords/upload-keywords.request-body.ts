import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class UploadKeywordsRequestBody {
  @ApiProperty({
    description: 'File url',
    example:
      'https://user-storage-dev.s3.us-west-2.amazonaws.com/avatars/user-id/keywords.csv',
  })
  @IsUrl()
  url: string;
}
