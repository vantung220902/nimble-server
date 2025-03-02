import { RequestUser } from '@common/interfaces';

export class SignOutCommand {
  constructor(
    public readonly accessToken: string,
    public readonly reqUser: RequestUser,
  ) {}
}
