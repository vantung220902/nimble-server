import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginatedApiResponseDto } from '../dtos/paginated-response.dto';

@Injectable()
export class PaginatedResponseInterceptor<T>
  implements NestInterceptor<T, PaginatedApiResponseDto<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<PaginatedApiResponseDto<T>> {
    return next.handle().pipe(
      map((response) => {
        const { skippedRecords, totalRecords, records, payloadSize, hasNext } =
          response || {};

        return {
          skippedRecords,
          totalRecords,
          records,
          payloadSize,
          hasNext,
        };
      }),
    );
  }
}
