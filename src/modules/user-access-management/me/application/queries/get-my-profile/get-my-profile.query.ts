import { RequestUser } from '@common/interfaces';

export class GetMyProfileQuery {
  constructor(public readonly reqUser: RequestUser) {}
}
