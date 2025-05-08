import { RefreshCommandResponse } from '@modules/authentication/application/commands/refresh/refresh.response';

describe('RefreshCommandResponse', () => {
  it('Should initialize RefreshCommandResponse correctly', () => {
    const response = new RefreshCommandResponse();
    response.accessToken = 'access-token';

    expect(response).toBeDefined();
    expect(response).toEqual(
      expect.objectContaining({
        accessToken: 'access-token',
      }),
    );
  });
});
