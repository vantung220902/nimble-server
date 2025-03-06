import { PaginatedApiResponseDto } from '@common/dtos';
import { CrawlContentDto, KeywordDto } from '@generated';
import { ApiProperty } from '@nestjs/swagger';
import { ProcessingStatus } from '@prisma/client';

class CrawledContentResponse
  implements Pick<CrawlContentDto, 'totalLinks' | 'totalGoogleAds'>
{
  @ApiProperty({
    description: 'Total number links',
  })
  totalLinks: number;

  @ApiProperty({
    description: 'Total google ads',
  })
  totalGoogleAds: number;
}

export class GetKeywordsResponse extends KeywordDto {
  status: ProcessingStatus;
  crawledContent?: CrawledContentResponse;
}

export class GetKeywordsQueryResponse extends PaginatedApiResponseDto<GetKeywordsResponse> {
  @ApiProperty({
    description: 'List of uploaded files',
    isArray: true,
  })
  records: GetKeywordsResponse[];
}
