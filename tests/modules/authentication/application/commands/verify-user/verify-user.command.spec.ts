import { VerifyUserCommand } from '@modules/authentication/application/commands/verify-user/verify-user.command';

describe('VerifyUserCommand', () => {
  it('Should initialize VerifyUserCommand correctly', () => {
    const command = new VerifyUserCommand({
      email: 'test@gmail.com',
      code: '123456',
    });

    expect(command).toBeDefined();
    expect(command.body).toEqual({
      email: 'test@gmail.com',
      code: '123456',
    });
  });
});
