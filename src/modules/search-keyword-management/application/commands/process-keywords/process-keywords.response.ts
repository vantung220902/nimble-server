import { CrawledGoogleResponse } from '@modules/crawler/interfaces';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProcessingStatus } from '@prisma/client';

export class ProcessKeywordsCommandResponse {
  @ApiProperty({
    description: 'Keyword',
    example: 'Nimble',
  })
  content: string;

  @ApiPropertyOptional({
    description: 'Keyword id',
  })
  keywordId?: string;

  @ApiProperty({
    description: 'Status',
  })
  status: ProcessingStatus;

  @ApiProperty({
    description: 'Content',
  })
  searchResult?: CrawledGoogleResponse;
}
