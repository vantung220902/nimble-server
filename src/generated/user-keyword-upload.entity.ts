import { ProcessingStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { FileKeywordsUploadEntity } from './file-keywords-upload.entity';
import { KeywordEntity } from './keyword.entity';

export class UserKeywordUploadEntity {
  @ApiProperty({
    required: false,
  })
  fileUploadId: string;
  @ApiProperty({
    required: false,
  })
  keywordId: string;
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
  })
  keyword?: KeywordEntity;
}
