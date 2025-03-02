import { QueryHandler } from '@nestjs/cqrs';
import { GetPrivateWriteUrlQuery } from './get-private-write-url.query';
import { GetPrivateWriteUrlQueryResponse } from './get-private-write-url.response';
import { QueryHandlerBase } from '@common/cqrs';
import { FileService } from '@modules/file/services';

@QueryHandler(GetPrivateWriteUrlQuery)
export class GetPrivateWriteUrlHandler extends QueryHandlerBase<
  GetPrivateWriteUrlQuery,
  GetPrivateWriteUrlQueryResponse
> {
  constructor(private readonly fileService: FileService) {
    super();
  }

  public async execute(
    query: GetPrivateWriteUrlQuery,
  ): Promise<GetPrivateWriteUrlQueryResponse> {
    const url = await this.fileService.getPrivateWriteUrl(
      query.reqUser.sub,
      query.option,
    );

    return { url } as GetPrivateWriteUrlQueryResponse;
  }
}
