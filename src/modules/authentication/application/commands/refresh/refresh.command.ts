import { RequestUser } from '@common/interfaces';

export class RefreshCommand {
  constructor(public readonly reqUser: RequestUser) {}
}
