import { GlobalExceptionFilter } from '@common/filters';
import { HttpException } from '@nestjs/common';
import { ArgumentsHost, HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Request, Response } from 'express';
import {
  anyNumber,
  anything,
  instance,
  mock,
  reset,
  verify,
  when,
} from 'ts-mockito';

describe('GlobalExceptionFilter', () => {
  const mockReq = mock<Request>();
  const mockRes = mock<Response>();
  const mockHttpArgumentHost = mock<HttpArgumentsHost>();
  const mockHost = mock<ArgumentsHost>();

  beforeEach(() => {
    when(mockReq.url).thenReturn('/path/to/api');
    when(mockRes.status(anyNumber())).thenCall(() => instance(mockRes));
    when(mockRes.json(anything())).thenCall((arg) => arg);
    when(mockHttpArgumentHost.getRequest()).thenCall(() => instance(mockReq));
    when(mockHttpArgumentHost.getResponse()).thenCall(() => instance(mockRes));
    when(mockHost.switchToHttp()).thenCall(() =>
      instance(mockHttpArgumentHost),
    );
  });

  afterEach(() => {
    reset<any>(mockReq, mockRes, mockHttpArgumentHost, mockHost);
  });

  it('Should able to handle HttpException', () => {
    const httpException = new HttpException(
      {
        errorId: 'error_id',
        message: 'message',
        error: ['error'],
      },
      400,
    );

    const response = new GlobalExceptionFilter().catch(
      httpException,
      instance(mockHost),
    );

    verify(mockRes.status(400)).once();
    verify(mockRes.json(anything())).once();

    expect(response).toEqual(
      expect.objectContaining({
        success: false,
        code: 400,
        errorId: 'error_id',
        message: 'message',
        error: ['error'],
        path: '/path/to/api',
      }),
    );

    expect(response.timestamp).toBeGreaterThan(0);
  });

  it('Should able to handle any error', () => {
    const error = new Error('Something wrong!');

    const response = new GlobalExceptionFilter().catch(
      error,
      instance(mockHost),
    );

    verify(mockRes.status(500)).once();
    verify(mockRes.json(anything())).once();

    expect(response).toEqual(
      expect.objectContaining({
        success: false,
        code: 500,
        errorId: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
        error: 'Something wrong!',
        path: '/path/to/api',
      }),
    );
    expect(response.timestamp).toBeGreaterThan(0);
  });

  it('Should not include stacktrace by default', () => {
    const error = new Error('Something wrong!');

    const response = new GlobalExceptionFilter().catch(
      error,
      instance(mockHost),
    );

    expect(response.stack).toBeUndefined();
  });

  it('Should include HttpException stacktrace', () => {
    const httpException = new HttpException(
      {
        errorId: 'error_id',
        message: 'message',
        error: ['error'],
      },
      400,
    );

    const response = new GlobalExceptionFilter({
      includeSensitive: true,
    }).catch(httpException, instance(mockHost));

    expect(response.stack).toBeDefined();
    expect(Array.isArray(response.stack)).toEqual(true);
    expect(response.stack.length).toBeGreaterThan(0);
  });

  it('Should include error stacktrace', () => {
    const error = new Error('Something wrong!');

    const response = new GlobalExceptionFilter({
      includeSensitive: true,
    }).catch(error, instance(mockHost));

    expect(response.stack).toBeDefined();
    expect(Array.isArray(response.stack)).toEqual(true);
    expect(response.stack.length).toBeGreaterThan(0);
  });
});
