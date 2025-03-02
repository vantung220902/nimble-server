import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { FileTypeEnum } from '../file.enum';

export class GetPrivateWriteUrlDto {
  @ApiProperty({
    description: 'Name of file',
    example: 'keywords.csv',
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;

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
  type: string;
}
