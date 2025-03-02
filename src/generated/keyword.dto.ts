import { ProcessingStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class KeywordDto {
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
    enum: ProcessingStatus,
    required: false,
  })
  status: ProcessingStatus;
}
