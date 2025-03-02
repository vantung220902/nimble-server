import { RequestUser } from '@common/interfaces';
import { GetKeywordsRequestQuery } from './get-keywords.request-query';

export class GetKeywordsQuery {
  constructor(
    public readonly reqUser: RequestUser,
    public readonly query: GetKeywordsRequestQuery,
  ) {}
}
