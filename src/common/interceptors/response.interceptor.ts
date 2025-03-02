import { ApiListResponseDto, ApiResponseDto } from '@common/dtos';
import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseDto<T> | ApiListResponseDto<T>> {
    const timestamp = new Date().getTime();
    return next.handle().pipe(
      map((data) => ({
        success: true,
        code: HttpStatus.OK,
        data,
        timestamp,
      })),
    );
  }
}
