import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class GetPrivateReadUrlDto {
  @ApiProperty({
    description: 'Path of file',
    example:
      'https://bucket-storage.s3.us-east-1.amazonaws.com/keywords/keywords.csv',
  })
  @IsUrl()
  filePath: string;
}
