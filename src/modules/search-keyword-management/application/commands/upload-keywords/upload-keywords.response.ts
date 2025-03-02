import { ApiProperty } from '@nestjs/swagger';

export class UploadKeywordsCommandResponse {
  @ApiProperty({
    description: 'Connection Id for sse',
  })
  connectionId: string;

  @ApiProperty({
    description: 'Total Keywords',
  })
  totalKeyword: number;
}
