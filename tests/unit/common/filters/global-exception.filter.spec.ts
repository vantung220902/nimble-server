import { GlobalExceptionFilter } from '@common/filters';
import { ArgumentsHost, HttpException } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
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
  const mockRequest = mock<any>();
  const mockResponse = mock<any>();
  const mockHttpArgumentsHost = mock<HttpArgumentsHost>();
  const mockHost = mock<ArgumentsHost>();

  beforeEach(() => {
    when(mockRequest.url).thenReturn('/path/to/api');

    when(mockResponse.status(anyNumber())).thenCall(() =>
      instance(mockResponse),
    );
    when(mockResponse.json(anything())).thenCall((arg) => arg);

    when(mockHttpArgumentsHost.getRequest()).thenCall(() =>
      instance(mockRequest),
    );
    when(mockHttpArgumentsHost.getResponse()).thenCall(() =>
      instance(mockResponse),
    );

    when(mockHost.switchToHttp()).thenCall(() =>
      instance(mockHttpArgumentsHost),
    );
  });

  afterEach(() => {
    reset(mockRequest, mockResponse, mockHttpArgumentsHost, mockHost);
  });

  test('should handle HttpException', () => {
    const exception = new HttpException(
      {
        errorId: 'error_id',
        message: 'message',
        error: ['my_error'],
      },
      400,
    );

    const response = new GlobalExceptionFilter().catch(
      exception,
      instance(mockHost),
    );

    verify(mockResponse.status(400)).once();
    verify(mockResponse.json(anything())).once();

    expect(response).toEqual(
      expect.objectContaining({
        success: false,
        code: 400,
        errorId: 'error_id',
        message: 'message',
        error: ['my_error'],
        path: '/path/to/api',
      }),
    );
    expect(response.timestamp).toBeGreaterThan(0);
  });

  test('should handle any error', () => {
    const error = new Error('something went wrong');

    const response = new GlobalExceptionFilter().catch(
      error,
      instance(mockHost),
    );

    verify(mockResponse.status(500)).once();
    verify(mockResponse.json(anything())).once();

    expect(response).toEqual(
      expect.objectContaining({
        success: false,
        code: 500,
        errorId: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
        error: 'something went wrong',
        path: '/path/to/api',
      }),
    );
    expect(response.timestamp).toBeGreaterThan(0);
  });

  test('should not include stacktrace by default', () => {
    const error = new Error('something went wrong');

    const response = new GlobalExceptionFilter().catch(
      error,
      instance(mockHost),
    );

    expect(response.stack).toBeUndefined();
  });

  test('should include HttpException stacktrace if specified', () => {
    const exception = new HttpException(
      {
        message: 'message',
        error: ['my_error'],
      },
      401,
    );

    const response = new GlobalExceptionFilter({
      includeSensitive: true,
    }).catch(exception, instance(mockHost));

    expect(response.stack).toBeDefined();
    expect(Array.isArray(response.stack)).toBeTruthy();
    expect(response.stack.length).toBeGreaterThan(0);
  });

  test('should include error stacktrace if specified', () => {
    const error = new Error('something went wrong');

    const response = new GlobalExceptionFilter({
      includeSensitive: true,
    }).catch(error, instance(mockHost));

    expect(response.stack).toBeDefined();
    expect(Array.isArray(response.stack)).toBeTruthy();
    expect(response.stack.length).toBeGreaterThan(0);
  });
});
