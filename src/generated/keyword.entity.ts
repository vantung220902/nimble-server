import { ProcessingStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { FileKeywordsUploadEntity } from './file-keywords-upload.entity';
import { CrawlContentEntity } from './crawl-content.entity';

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
  })
  fileUploadId: string;
  @ApiProperty({
    enum: ProcessingStatus,
    required: false,
  })
  status: ProcessingStatus;
  @ApiProperty({
    required: false,
  })
  fileUpload?: FileKeywordsUploadEntity;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  crawledContent?: CrawlContentEntity | null;
}
