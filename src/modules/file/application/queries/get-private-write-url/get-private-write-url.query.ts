import { RequestUser } from '@common/interfaces';
import { GetPrivateWriteUrlRequestQuery } from './get-private-write-url.request-query';

export class GetPrivateWriteUrlQuery {
  constructor(
    public readonly reqUser: RequestUser,
    public readonly option: GetPrivateWriteUrlRequestQuery,
  ) {}
}
