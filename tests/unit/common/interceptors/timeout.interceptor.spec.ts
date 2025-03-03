import { TimeoutInterceptor } from '@common/interceptors/timeout.interceptor';
import {
  CallHandler,
  ExecutionContext,
  RequestTimeoutException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

describe('TimeoutInterceptor', () => {
  let interceptor: TimeoutInterceptor;
  let reflector: jest.MockedObject<Reflector>;
  let context: jest.MockedObject<ExecutionContext>;
  let next: jest.MockedObject<CallHandler<string>>;

  beforeEach(() => {
    reflector = {
      get: jest.fn(),
    } as jest.MockedObject<Reflector>;

    context = {
      getHandler: jest.fn(),
    } as jest.MockedObject<ExecutionContext>;

    next = {
      handle: jest.fn(),
    } as jest.MockedObject<CallHandler<string>>;

    interceptor = new TimeoutInterceptor(reflector);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should use default timeout when no custom timeout is provided', (done) => {
    reflector.get.mockReturnValue(undefined);
    next.handle.mockReturnValue(of('test').pipe(delay(100)));

    interceptor.intercept(context, next).subscribe({
      next: (value) => {
        expect(value).toBe('test');
        done();
      },
      error: (error) => done(error),
    });
  });

  it('should use custom timeout from reflector', (done) => {
    reflector.get.mockReturnValue(1); // 1 second timeout
    next.handle.mockReturnValue(of('test').pipe(delay(100)));

    interceptor.intercept(context, next).subscribe({
      next: (value) => {
        expect(value).toBe('test');
        done();
      },
      error: (error) => done(error),
    });
  });

  it('should throw RequestTimeoutException when timeout occurs', (done) => {
    reflector.get.mockReturnValue(0.05);
    next.handle.mockReturnValue(of('test').pipe(delay(200)));

    interceptor.intercept(context, next).subscribe({
      next: () => done(new Error('Should have timed out')),
      error: (error) => {
        expect(error).toBeInstanceOf(RequestTimeoutException);
        done();
      },
    });
  });

  it('should propagate other errors', (done) => {
    reflector.get.mockReturnValue(1);
    const testError = new Error('Test error');
    next.handle.mockReturnValue(throwError(() => testError));

    interceptor.intercept(context, next).subscribe({
      next: () => done(new Error('Should have errored')),
      error: (error) => {
        expect(error).toBe(testError);
        done();
      },
    });
  });

  it('should allow custom timeout in constructor', () => {
    const customTimeout = 5;
    const interceptorWithCustomTimeout = new TimeoutInterceptor(
      reflector,
      customTimeout,
    );
    expect(interceptorWithCustomTimeout).toBeDefined();
  });
});
