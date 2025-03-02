import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFileKeywordsUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  uploadedAt?: Date;
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  fileUrl?: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
  })
  @IsOptional()
  @IsInt()
  totalKeywords?: number;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  connectionId?: string | null;
}
