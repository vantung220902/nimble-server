import { QueryHandlerBase } from '@common/cqrs';
import { FileService } from '@modules/file/services';
import { QueryHandler } from '@nestjs/cqrs';
import { GetPrivateReadUrlQuery } from './get-private-read-url.query';
import { GetPrivateReadUrlQueryResponse } from './get-private-read-url.response';

@QueryHandler(GetPrivateReadUrlQuery)
export class GetPrivateReadUrlHandler extends QueryHandlerBase<
  GetPrivateReadUrlQuery,
  GetPrivateReadUrlQueryResponse
> {
  constructor(private readonly fileService: FileService) {
    super();
  }

  public async execute(
    query: GetPrivateReadUrlQuery,
  ): Promise<GetPrivateReadUrlQueryResponse> {
    const url = await this.fileService.getPrivateReadUrl(query.option);

    return { url } as GetPrivateReadUrlQueryResponse;
  }
}
