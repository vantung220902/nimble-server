import { VerifyUserRequestBody } from './verify-user.request-body';

export class VerifyUserCommand {
  constructor(public readonly body: VerifyUserRequestBody) {}
}
