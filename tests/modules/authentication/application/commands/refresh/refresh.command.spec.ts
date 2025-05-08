import { RefreshCommand } from '@modules/authentication/application/commands/refresh/refresh.command';
import { UserStatus } from '@prisma/client';

describe('RefreshCommand', () => {
  it('Should initialize RefreshCommand correctly', () => {
    const mockReqUser = {
      sub: '7e97e07f-843f-4ff4-b168-2854104118c7',
      email: 'example@google.com',
      status: UserStatus.ACTIVE,
    };
    const refreshCommand = new RefreshCommand(mockReqUser);

    expect(refreshCommand).toBeDefined();
    expect(refreshCommand.reqUser).toEqual(mockReqUser);
  });
});
