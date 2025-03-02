import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { getError, getStack } from '../errors';

export interface GlobalExceptionFilterOptions {
  includeSensitive?: boolean;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly includeSensitive: boolean;

  constructor(options?: GlobalExceptionFilterOptions) {
    this.includeSensitive = options && options.includeSensitive;
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<any>();
    const request = ctx.getRequest<any>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      response.err = exception;

      const { errorId, message, error } = exception.getResponse() as {
        errorId: unknown;
        message: unknown;
        error: unknown;
      };

      return response.status(status).json({
        success: false,
        code: status,
        errorId: errorId ?? HttpStatus[`${status}`],
        message,
        error,
        stack: this.includeSensitive ? getStack(exception) : undefined,
        timestamp: new Date().getTime(),
        path: request.url,
      });
    }

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const error = getError(exception);
    response.err = error;

    return response.status(status).json({
      success: false,
      code: status,
      errorId: HttpStatus[`${status}`],
      message: 'Internal server error',
      error: error.message,
      stack: this.includeSensitive ? getStack(error) : undefined,
      timestamp: new Date().getTime(),
      path: request.url,
    });
  }
}
