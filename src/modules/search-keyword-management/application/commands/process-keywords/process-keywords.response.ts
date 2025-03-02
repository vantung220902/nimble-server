import { CrawledGoogleResponse } from '@modules/crawler/interfaces';
import { ApiProperty } from '@nestjs/swagger';
import { ProcessingStatus } from '@prisma/client';

export class ProcessKeywordsCommandResponse {
  @ApiProperty({
    description: 'Keyword',
    example: 'Nimble',
  })
  keyword: string;

  @ApiProperty({
    description: 'Status',
  })
  status: ProcessingStatus;

  @ApiProperty({
    description: 'Content',
  })
  searchResult?: CrawledGoogleResponse;
}
