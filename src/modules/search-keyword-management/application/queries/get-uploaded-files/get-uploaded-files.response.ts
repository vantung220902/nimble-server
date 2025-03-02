import { PaginatedApiResponseDto } from '@common/dtos';
import { FileKeywordsUploadDto } from '@generated';
import { ApiProperty } from '@nestjs/swagger';

export class GetUploadedFilesResponse extends FileKeywordsUploadDto {}

export class GetUploadedFilesQueryResponse extends PaginatedApiResponseDto<GetUploadedFilesResponse> {
  @ApiProperty({
    description: 'List of uploaded files',
    isArray: true,
  })
  records: GetUploadedFilesResponse[];
}
