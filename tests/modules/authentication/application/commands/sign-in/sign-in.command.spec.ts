import { SignInCommand } from '@modules/authentication/application/commands/sign-in/sign-in.command';

describe('SignInCommand', () => {
  it('Should initialize SignInCommand correctly', () => {
    const signInCommand = new SignInCommand({
      email: 'example@google.com',
      password: 'Abcd@123456',
    });

    expect(signInCommand).toBeDefined();
    expect(signInCommand.body).toEqual({
      email: 'example@google.com',
      password: 'Abcd@123456',
    });
  });
});
