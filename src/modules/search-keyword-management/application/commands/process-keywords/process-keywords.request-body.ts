import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString, IsUUID } from 'class-validator';

export class ProcessKeywordsRequestBody {
  @ApiProperty({
    description: 'Keywords',
    example: ['Nimble', 'Fullstack', 'NodeJS', 'Book', 'Desk'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  keywords: string[];

  @ApiProperty({
    description: 'File keywords upload id',
    example: 'b0f61762-8688-4477-b304-4c38eba78639',
  })
  @IsUUID()
  fileUploadId: string;

  @ApiProperty({
    description: 'Connection id',
    example: 'b0f61762-8688-4477-b304-4c38eba78639',
  })
  @IsUUID()
  connectionId: string;
}
