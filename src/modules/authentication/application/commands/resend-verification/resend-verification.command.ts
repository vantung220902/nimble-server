import { ResendVerificationRequestBody } from './resend-verification.request-body';

export class ResendVerificationCommand {
  constructor(public readonly body: ResendVerificationRequestBody) {}
}
