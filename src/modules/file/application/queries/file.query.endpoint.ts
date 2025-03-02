import { QueryEndpoint } from '@common/cqrs';
import { ApiResponse } from '@common/decorators';
import { AuthenticationGuard } from '@common/guards';
import { ResponseInterceptor } from '@common/interceptors';
import {
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetPrivateReadUrlQuery } from './get-private-read-url/get-private-read-url.query';
import { GetPrivateReadUrlRequestQuery } from './get-private-read-url/get-private-read-url.request-query';
import { GetPrivateReadUrlQueryResponse } from './get-private-read-url/get-private-read-url.response';
import { GetPrivateWriteUrlQuery } from './get-private-write-url/get-private-write-url.query';
import { GetPrivateWriteUrlRequestQuery } from './get-private-write-url/get-private-write-url.request-query';
import { GetPrivateWriteUrlQueryResponse } from './get-private-write-url/get-private-write-url.response';

@ApiTags('File')
@ApiBearerAuth()
@Controller({
  version: '1',
  path: 'file',
})
@UseGuards(AuthenticationGuard)
@UseInterceptors(ResponseInterceptor)
export class FileQueryEndpoint extends QueryEndpoint {
  constructor(protected queryBus: QueryBus) {
    super(queryBus);
  }

  @ApiOperation({ description: 'Get presigned url to download file from S3' })
  @ApiResponse(GetPrivateReadUrlQueryResponse)
  @Get('presigned-download-url')
  public getPresignedDownloadUrl(
    @Query() query: GetPrivateReadUrlRequestQuery,
  ): Promise<GetPrivateReadUrlQueryResponse> {
    return this.queryBus.execute<
      GetPrivateReadUrlQuery,
      GetPrivateReadUrlQueryResponse
    >(new GetPrivateReadUrlQuery(query));
  }

  @ApiOperation({ description: 'Get presigned url to upload file to S3' })
  @ApiResponse(GetPrivateWriteUrlQueryResponse)
  @Get('presigned-upload-url')
  getPresignedUploadUrl(
    @Request() request,
    @Query() query: GetPrivateWriteUrlRequestQuery,
  ): Promise<GetPrivateWriteUrlQueryResponse> {
    return this.queryBus.execute<
      GetPrivateWriteUrlQuery,
      GetPrivateWriteUrlQueryResponse
    >(new GetPrivateWriteUrlQuery(request.user, query));
  }
}
