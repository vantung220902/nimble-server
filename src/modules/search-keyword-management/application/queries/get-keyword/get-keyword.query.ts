import { RequestUser } from '@common/interfaces';

export class GetKeywordQuery {
  constructor(
    public readonly reqUser: RequestUser,
    public readonly id: string,
  ) {}
}
