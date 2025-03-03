import { getTokenFromHeader, waiter } from '@common/utils/http';
import { Request } from 'express';

describe('HTTPUtils', () => {
  describe('getTokenFromHeader', () => {
    test('should return token if authorization header is valid', () => {
      const headers: Request['headers'] = {
        authorization: 'Bearer token',
      };
      expect(getTokenFromHeader(headers)).toEqual('token');
    });

    test('should return undefined if authorization header is missing', () => {
      const headers: Request['headers'] = {};
      expect(getTokenFromHeader(headers)).toBeUndefined();
    });

    test('should return undefined if authorization type is not Bearer', () => {
      const headers: Request['headers'] = {
        authorization: 'Basic token',
      };
      expect(getTokenFromHeader(headers)).toBeUndefined();
    });
  });

  describe('waiter', () => {
    test('should resolve after the specified timeout', async () => {
      const timeout = 1000;
      const start = Date.now();
      await waiter(timeout);
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(timeout);
    });
  });
});
