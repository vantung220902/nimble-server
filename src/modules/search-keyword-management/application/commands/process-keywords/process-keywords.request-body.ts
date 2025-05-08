import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString, IsUUID } from 'class-validator';

export class ProcessKeywordsRequestBody {
  @ApiProperty({
    description: 'Keywords',
    example: ['Nimble', 'Fullstack', 'NodeJS', 'Book', 'Desk'],
  })
  @IsArray({ message: 'Keywords must be array' })
  @ArrayNotEmpty({ message: 'Keywords are required' })
  @IsString({ each: true, message: 'Keyword must be a string' })
  keywords: string[];

  @ApiProperty({
    description: 'File keywords upload id',
    example: 'b0f61762-8688-4477-b304-4c38eba78639',
  })
  @IsUUID(undefined, { message: 'FleUploadId must be a UUID' })
  fileUploadId: string;

  @ApiProperty({
    description: 'Connection id',
    example: 'b0f61762-8688-4477-b304-4c38eba78639',
  })
  @IsUUID(undefined, { message: 'ConnectionId must be a UUID' })
  connectionId: string;
}
