import { QueryEndpoint } from '@common/cqrs';
import { PaginatedApiResponse } from '@common/decorators';
import { AuthenticationGuard } from '@common/guards';
import {
  PaginatedResponseInterceptor,
  ResponseInterceptor,
} from '@common/interceptors';
import { GetUploadedFilesQuery } from '@modules/search-keyword-management/application/queries/get-uploaded-files/get-uploaded-files.query';
import { GetUploadedFilesRequestQuery } from '@modules/search-keyword-management/application/queries/get-uploaded-files/get-uploaded-files.request-query';
import { GetUploadedFilesQueryResponse } from '@modules/search-keyword-management/application/queries/get-uploaded-files/get-uploaded-files.response';
import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Search Keywords Management')
@ApiBearerAuth()
@Controller({
  version: '1',
  path: 'search-keywords',
})
@UseGuards(AuthenticationGuard)
@UseInterceptors(ResponseInterceptor)
export class SearchKeywordManagementQueryEndpoint extends QueryEndpoint {
  constructor(protected queryBus: QueryBus) {
    super(queryBus);
  }

  @ApiOperation({ description: 'Get my uploaded keywords files' })
  @UseInterceptors(PaginatedResponseInterceptor)
  @PaginatedApiResponse(GetUploadedFilesQueryResponse)
  @Get('uploaded-files')
  public getUploadedFiles(
    @Req() req,
    @Query() query: GetUploadedFilesRequestQuery,
  ): Promise<GetUploadedFilesQueryResponse> {
    return this.queryBus.execute<
      GetUploadedFilesQuery,
      GetUploadedFilesQueryResponse
    >(new GetUploadedFilesQuery(req.user, query));
  }
}
