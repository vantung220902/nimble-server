import { loggerRequestMiddleware } from '@logger/logger-request.middleware';
import { NextFunction, Request, Response } from 'express';

describe('loggerRequestMiddleware', () => {
  it('Should add custom header get from authorization token', () => {
    const req = {
      headers: {
        authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZTk3ZTA3Zi04NDNmLTRmZjQtYjE2OC0yODU0MTA0MTE4YzciLCJlbWFpbCI6InZhbnR1bmcyMjA5MDJAZ21haWwuY29tIiwic3RhdHVzIjoiQUNUSVZFIiwiaWF0IjoxNzQwOTg3ODIzLCJleHAiOjE3NDA5OTg2MjN9.I2L9zFHgdEixId9Nr-QDXI6i0eKtHfWXsUZcPl6y3-w',
      },
    } as Request;
    const res = {} as Response;
    const mockNextFunction = jest.fn() as NextFunction;

    loggerRequestMiddleware(req, res, mockNextFunction);
    expect(req.headers['x-request-sub']).toEqual(
      '7e97e07f-843f-4ff4-b168-2854104118c7',
    );
    expect(req.headers['x-request-user-id']).toEqual(
      '7e97e07f-843f-4ff4-b168-2854104118c7',
    );
    expect(req.headers['x-request-username']).toEqual(
      'vantung220902@gmail.com',
    );

    expect(mockNextFunction).toHaveBeenCalledTimes(1);
  });

  it('Should handle empty authorization token', () => {
    const req = {
      headers: {},
    } as Request;
    const res = {} as Response;
    const mockNextFunction = jest.fn() as NextFunction;

    loggerRequestMiddleware(req, res, mockNextFunction);
    expect(req.headers['x-request-sub']).toBeUndefined();
    expect(req.headers['x-request-user-id']).toBeUndefined();
    expect(req.headers['x-request-username']).toBeUndefined();

    expect(mockNextFunction).toHaveBeenCalledTimes(1);
  });

  it('Should handle invalid authorization token', () => {
    const req = {
      headers: {
        authorization: 'Bearer invalid',
      },
    } as Request;
    const res = {} as Response;
    const mockNextFunction = jest.fn() as NextFunction;

    try {
      loggerRequestMiddleware(req, res, mockNextFunction);
    } catch (error) {
      expect(error.message).toContain(
        'The first argument must be of type string',
      );
    }
  });
});
