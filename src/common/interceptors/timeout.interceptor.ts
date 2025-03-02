import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

const DEFAULT_TIMEOUT_SECONDS = 30;

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private timeout: number;

  constructor(
    private readonly reflector: Reflector,
    timeout: number = DEFAULT_TIMEOUT_SECONDS,
  ) {
    this.timeout = timeout;
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const contextTimeout = this.reflector.get<number>(
      'request-timeout',
      context.getHandler(),
    );

    const timeoutSeconds = contextTimeout || this.timeout;

    return next.handle().pipe(
      timeout(timeoutSeconds * 1000),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          throw new RequestTimeoutException();
        }
        throw err;
      }),
    );
  }
}
