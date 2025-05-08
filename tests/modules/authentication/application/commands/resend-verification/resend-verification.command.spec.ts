import { ResendVerificationCommand } from '@modules/authentication/application/commands/resend-verification/resend-verification.command';

describe('ResendVerificationCommand', () => {
  it('Should initialize ResendVerificationCommand correctly', () => {
    const resendVerificationCommand = new ResendVerificationCommand({
      email: 'example@google.com',
    });

    expect(resendVerificationCommand).toBeDefined();
    expect(resendVerificationCommand.body).toEqual(
      expect.objectContaining({
        email: 'example@google.com',
      }),
    );
  });
});
