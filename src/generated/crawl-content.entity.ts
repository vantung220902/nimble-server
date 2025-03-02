import { ApiProperty } from '@nestjs/swagger';
import { KeywordEntity } from './keyword.entity';

export class CrawlContentEntity {
  @ApiProperty({
    required: false,
  })
  id: string;
  @ApiProperty({
    required: false,
  })
  keywordId: string;
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
  @ApiProperty({
    required: false,
  })
  keyword?: KeywordEntity;
}
