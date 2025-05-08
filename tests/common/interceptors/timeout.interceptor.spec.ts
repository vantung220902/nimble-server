import { TimeoutInterceptor } from '@common/interceptors';
import {
  CallHandler,
  ExecutionContext,
  RequestTimeoutException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { throwError, timer } from 'rxjs';
import { instance, mock, when } from 'ts-mockito';

describe('TimeoutInterceptor', () => {
  const mockContext = mock<ExecutionContext>();
  const mockCallHandler = mock<CallHandler>();

  it('Should not throw error if not timeout', (done: jest.DoneCallback) => {
    const observable = timer(1 * 1000);
    when(mockCallHandler.handle()).thenReturn(observable);

    const mockReflector = {
      get: () => 2,
    } as any as Reflector;

    const result = new TimeoutInterceptor(mockReflector).intercept(
      instance(mockContext),
      instance(mockCallHandler),
    );

    result.subscribe({
      next: (value) => {
        expect(value).toEqual(0);
        done();
      },
    });
  });

  it('should throw RequestTimeoutException if timeout', (done: jest.DoneCallback) => {
    const observable = timer(2 * 1000);
    when(mockCallHandler.handle()).thenReturn(observable);

    const mockReflector = {
      get: () => 1,
    } as any as Reflector;

    const result = new TimeoutInterceptor(mockReflector).intercept(
      instance(mockContext),
      instance(mockCallHandler),
    );

    result.subscribe({
      error: (error) => {
        expect(error).toBeInstanceOf(RequestTimeoutException);
        done();
      },
    });
  });

  it(
    'Should have default timeout of 30 seconds',
    (done: jest.DoneCallback) => {
      const observable = timer(31 * 1000);
      when(mockCallHandler.handle()).thenReturn(observable);

      const mockReflector = {
        get: () => undefined,
      } as any as Reflector;

      const result = new TimeoutInterceptor(mockReflector).intercept(
        instance(mockContext),
        instance(mockCallHandler),
      );

      result.subscribe({
        error: (error) => {
          expect(error).toBeInstanceOf(RequestTimeoutException);
          done();
        },
      });
    },
    32 * 1000,
  );

  it('Should use timeout argument', (done: jest.DoneCallback) => {
    const observable = timer(1 * 1000);
    when(mockCallHandler.handle()).thenReturn(observable);

    const mockReflector = {
      get: () => undefined,
    } as any as Reflector;

    const result = new TimeoutInterceptor(mockReflector, 2 * 1000).intercept(
      instance(mockContext),
      instance(mockCallHandler),
    );

    result.subscribe({
      next: (value) => {
        expect(value).toEqual(0);
        done();
      },
    });
  });

  it('Should throw immediately on other errors', (done: jest.DoneCallback) => {
    const error = new Error('Something wrong!');
    const observable = throwError(() => error);
    when(mockCallHandler.handle()).thenReturn(observable);

    const mockReflector = {
      get: () => 1,
    } as any as Reflector;

    const result = new TimeoutInterceptor(mockReflector).intercept(
      instance(mockContext),
      instance(mockCallHandler),
    );

    result.subscribe({
      error: (error) => {
        expect(error).toBe(error);
        done();
      },
    });
  });
});
