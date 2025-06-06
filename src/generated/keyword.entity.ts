import { ApiProperty } from '@nestjs/swagger';
import { CrawlContentEntity } from './crawl-content.entity';
import { UserKeywordUploadEntity } from './user-keyword-upload.entity';

export class KeywordEntity {
  @ApiProperty({
    required: false,
  })
  id: string;
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
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true,
  })
  resolvedAt: Date | null;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  crawledContent?: CrawlContentEntity | null;
  @ApiProperty({
    isArray: true,
    required: false,
  })
  fileUploads?: UserKeywordUploadEntity[];
}
