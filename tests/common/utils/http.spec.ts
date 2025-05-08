import { getTokenFromHeader, waiter } from '@common/utils';

describe('HTTP', () => {
  describe('getTokenFromHeader', () => {
    it('Should return token if authorization header is valid', () => {
      const headers = {
        authorization: 'Bearer test-token',
      };
      const authorToken = getTokenFromHeader(headers);

      expect(authorToken).toEqual('test-token');
    });

    it('Should return undefined if missing authorization header', () => {
      const headers = {};
      const authorToken = getTokenFromHeader(headers);

      expect(authorToken).toBeUndefined();
    });

    it('Should return undefined if token is invalid', () => {
      const headers = {
        authorization: 'Invalid test-token',
      };
      const authorToken = getTokenFromHeader(headers);

      expect(authorToken).toBeUndefined();
    });
  });

  describe('waiter', () => {
    it('Should resolve after specified timeout', async () => {
      const timeout = 1000;
      const start = Date.now();
      await waiter(timeout);
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(timeout);
    });
  });
});
