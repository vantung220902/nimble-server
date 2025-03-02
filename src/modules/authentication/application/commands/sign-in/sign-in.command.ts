import { SignInRequestBody } from './sign-in.request-body';

export class SignInCommand {
  constructor(public readonly body: SignInRequestBody) {}
}
