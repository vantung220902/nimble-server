import { SignInCommandResponse } from '@modules/authentication/application/commands/sign-in/sign-in.response';

describe('SignInCommandResponse', () => {
  it('Should initialize SignInCommandResponse correctly', () => {
    const signInResponse = new SignInCommandResponse();
    signInResponse.accessToken = 'access-token';

    expect(signInResponse).toBeDefined();
    expect(signInResponse).toEqual({
      accessToken: 'access-token',
    });
  });
});
