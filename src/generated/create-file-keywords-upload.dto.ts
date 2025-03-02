import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFileKeywordsUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  uploadedAt: Date;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fileUrl: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  @IsNotEmpty()
  @IsInt()
  totalKeywords: number;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  connectionId?: string;
}
