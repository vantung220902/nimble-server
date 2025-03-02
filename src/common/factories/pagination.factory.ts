import { PaginatedApiResponseDto } from '../dtos/paginated-response.dto';
import { PaginationRequest } from '../interfaces/pagination-request';

export class Pagination {
  static of<T>(
    { take, skip }: PaginationRequest,
    totalRecords: number,
    dtos: T[],
  ): PaginatedApiResponseDto<T> {
    const hasNext = totalRecords > skip + take;

    return {
      skippedRecords: skip,
      totalRecords,
      records: dtos,
      payloadSize: dtos.length,
      hasNext,
    };
  }
}
