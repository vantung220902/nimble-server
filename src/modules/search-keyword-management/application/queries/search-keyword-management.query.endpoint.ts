import { QueryEndpoint } from '@common/cqrs';
import { ApiResponse, PaginatedApiResponse } from '@common/decorators';
import { AuthenticationGuard } from '@common/guards';
import {
  PaginatedResponseInterceptor,
  ResponseInterceptor,
} from '@common/interceptors';
import { GetKeywordQuery } from '@modules/search-keyword-management/application/queries/get-keyword/get-keyword.query';
import { GetKeywordRequestParam } from '@modules/search-keyword-management/application/queries/get-keyword/get-keyword.request-param';
import { GetKeywordQueryResponse } from '@modules/search-keyword-management/application/queries/get-keyword/get-keyword.response';
import { GetKeywordsQuery } from '@modules/search-keyword-management/application/queries/get-keywords/get-keywords.query';
import { GetKeywordsRequestQuery } from '@modules/search-keyword-management/application/queries/get-keywords/get-keywords.request-query';
import { GetKeywordsQueryResponse } from '@modules/search-keyword-management/application/queries/get-keywords/get-keywords.response';
import { GetUploadedFilesQuery } from '@modules/search-keyword-management/application/queries/get-uploaded-files/get-uploaded-files.query';
import { GetUploadedFilesRequestQuery } from '@modules/search-keyword-management/application/queries/get-uploaded-files/get-uploaded-files.request-query';
import { GetUploadedFilesQueryResponse } from '@modules/search-keyword-management/application/queries/get-uploaded-files/get-uploaded-files.response';
import {
  Controller,
  Get,
  Param,
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

  @ApiOperation({ description: 'Get list keywords endpoint' })
  @UseInterceptors(PaginatedResponseInterceptor)
  @PaginatedApiResponse(GetKeywordsQueryResponse)
  @Get()
  public getKeywords(
    @Req() req,
    @Query() query: GetKeywordsRequestQuery,
  ): Promise<GetKeywordsQueryResponse> {
    return this.queryBus.execute<GetKeywordsQuery, GetKeywordsQueryResponse>(
      new GetKeywordsQuery(req.user, query),
    );
  }

  @ApiOperation({ description: 'Get list keywords endpoint' })
  @UseInterceptors(ResponseInterceptor)
  @ApiResponse(GetKeywordQueryResponse)
  @Get(':id')
  public getKeyword(
    @Req() req,
    @Param() { id }: GetKeywordRequestParam,
  ): Promise<GetKeywordQueryResponse> {
    return this.queryBus.execute<GetKeywordQuery, GetKeywordQueryResponse>(
      new GetKeywordQuery(req.user, id),
    );
  }
}
