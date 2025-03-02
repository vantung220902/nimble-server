import { ProcessingStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class FileKeywordsUploadDto {
  @ApiProperty({
    required: false,
  })
  id: string;
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
  })
  uploadedAt: Date;
  @ApiProperty({
    required: false,
  })
  fileUrl: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
  })
  totalKeywords: number;
  @ApiProperty({
    enum: ProcessingStatus,
    required: false,
  })
  status: ProcessingStatus;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  connectionId: string | null;
}
