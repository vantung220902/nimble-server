import { loggerRequestMiddleware } from '@logger/logger-request.middleware';
import { NextFunction } from 'express';

describe('loggerRequestMiddleware', () => {
  it('should set x-request headers if authorization header is present', () => {
    const req = {
      headers: {
        authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZTk3ZTA3Zi04NDNmLTRmZjQtYjE2OC0yODU0MTA0MTE4YzciLCJlbWFpbCI6InZhbnR1bmcyMjA5MDJAZ21haWwuY29tIiwic3RhdHVzIjoiQUNUSVZFIiwiaWF0IjoxNzQwOTg3ODIzLCJleHAiOjE3NDA5OTg2MjN9.I2L9zFHgdEixId9Nr-QDXI6i0eKtHfWXsUZcPl6y3-w',
      },
    } as any as jest.MockedObject<Request>;
    const res = {} as any as jest.MockedObject<Response>;
    const next = jest.fn() as NextFunction;

    loggerRequestMiddleware(req as Request, res, next);

    expect(req.headers['x-request-sub']).toBe(
      '7e97e07f-843f-4ff4-b168-2854104118c7',
    );
    expect(req.headers['x-request-user-id']).toBe(
      '7e97e07f-843f-4ff4-b168-2854104118c7',
    );
    expect(req.headers['x-request-username']).toBe('vantung220902@gmail.com');

    expect(next).toHaveBeenCalled();
  });

  it('should not set x-request headers if authorization header is not present', () => {
    const req = {
      headers: {},
    } as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    loggerRequestMiddleware(req, res, next);

    expect(req.headers['x-request-sub']).toBeUndefined();
    expect(req.headers['x-request-user-id']).toBeUndefined();
    expect(req.headers['x-request-username']).toBeUndefined();

    expect(next).toHaveBeenCalled();
  });
});
