import { SignOutCommand } from '@modules/authentication/application/commands/sign-out/sign-out.command';
import { UserStatus } from '@prisma/client';

describe('SignOutCommand', () => {
  it('Should initialize SignOutCommand correctly', () => {
    const mockReqUser = {
      sub: '7e97e07f-843f-4ff4-b168-2854104118c7',
      email: 'example@google.com',
      status: UserStatus.ACTIVE,
    };
    const signOutCommand = new SignOutCommand('accessToken', mockReqUser);

    expect(signOutCommand).toBeDefined();
    expect(signOutCommand).toEqual({
      accessToken: 'accessToken',
      reqUser: mockReqUser,
    });
  });
});
