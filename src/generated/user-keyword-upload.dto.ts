import { ProcessingStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserKeywordUploadDto {
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
