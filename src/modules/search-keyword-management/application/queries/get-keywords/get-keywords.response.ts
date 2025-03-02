import { PaginatedApiResponseDto } from '@common/dtos';
import { KeywordDto } from '@generated';
import { ApiProperty } from '@nestjs/swagger';
import { ProcessingStatus } from '@prisma/client';

export class GetKeywordsResponse extends KeywordDto {
  status: ProcessingStatus;
}

export class GetKeywordsQueryResponse extends PaginatedApiResponseDto<GetKeywordsResponse> {
  @ApiProperty({
    description: 'List of uploaded files',
    isArray: true,
  })
  records: GetKeywordsResponse[];
}
