import { ApiProperty } from '@nestjs/swagger';

export class CrawlContentDto {
  @ApiProperty({
    required: false,
  })
  id: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
  })
  totalGoogleAds: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
  })
  totalLinks: number;
  @ApiProperty({
    required: false,
  })
  content: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
  })
  createdAt: Date;
}
