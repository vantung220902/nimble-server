import { CrawlContentDto, KeywordDto } from '@generated';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProcessingStatus } from '@prisma/client';

class CrawledContentResponse
  implements Pick<CrawlContentDto, 'totalLinks' | 'totalGoogleAds' | 'content'>
{
  @ApiProperty({
    description: 'Total number links',
  })
  totalLinks: number;

  @ApiProperty({
    description: 'Total google ads',
  })
  totalGoogleAds: number;

  @ApiProperty({ description: 'HTML content' })
  content: string;
}

export class GetKeywordQueryResponse extends KeywordDto {
  @ApiProperty({
    description: 'Status',
  })
  status: ProcessingStatus;

  @ApiPropertyOptional({
    description: 'Crawled response',
  })
  crawledContent?: CrawledContentResponse;
}
