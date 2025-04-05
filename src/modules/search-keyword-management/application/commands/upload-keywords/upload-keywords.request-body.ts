import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class UploadKeywordsRequestBody {
  @ApiProperty({
    description: 'File url',
    example:
      'https://user-storage-dev.s3.us-east-1.amazonaws.com/avatars/user-id/keywords.csv',
  })
  @IsUrl()
  url: string;
}
