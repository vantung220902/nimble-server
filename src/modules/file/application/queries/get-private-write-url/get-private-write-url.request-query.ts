import { FileTypeEnum } from '@modules/file/file.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetPrivateWriteUrlRequestQuery {
  @ApiProperty({
    description: 'Name of file',
    example: 'keywords.csv',
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiPropertyOptional({
    description: 'Custom key',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  customKey?: string;

  @ApiProperty({
    description: 'Content type of file',
    example: 'text/csv',
  })
  @IsString()
  @IsNotEmpty()
  contentType: string;

  @ApiProperty({
    description: 'Type of file',
    enum: FileTypeEnum,
    example: FileTypeEnum.KEYWORDS,
  })
  @IsEnum(FileTypeEnum)
  type: FileTypeEnum;
}
