import { SignUpCommand } from '@modules/authentication/application/commands/sign-up/sign-up.command';

describe('SignUpCommand', () => {
  it('Should initialize SignUpCommand correctly', () => {
    const signUpCommand = new SignUpCommand({
      confirmPassword: 'Abcd@123456',
      password: 'Abcd@123456',
      email: 'test@gmail.com',
      firstName: 'Tung',
      lastName: 'Nguyen',
    });

    expect(signUpCommand).toBeDefined();
    expect(signUpCommand.body).toEqual(
      expect.objectContaining({
        confirmPassword: 'Abcd@123456',
        password: 'Abcd@123456',
        email: 'test@gmail.com',
        firstName: 'Tung',
        lastName: 'Nguyen',
      }),
    );
  });
});
