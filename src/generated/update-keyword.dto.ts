import { IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateKeywordDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  resolvedAt?: Date | null;
}
