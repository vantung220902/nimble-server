import { SignUpRequestBody } from './sign-up.request-body';

export class SignUpCommand {
  constructor(public readonly body: SignUpRequestBody) {}
}
