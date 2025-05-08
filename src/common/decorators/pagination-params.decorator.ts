import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PaginationRequest } from '../interfaces/pagination-request.interface';

export interface DefaultPagination {
  defaultSkip?: number;
  defaultTake?: number;
  maxAllowedSize?: number;
}

export const PaginationParams = createParamDecorator(
  (
    data: DefaultPagination = {
      defaultSkip: 0,
      defaultTake: 10,
      maxAllowedSize: 100,
    },
    ctx: ExecutionContext,
  ): DefaultPagination & PaginationRequest => {
    const { query } = ctx.switchToHttp().getRequest();
    const { ...params } = query;

    let { skip, take } = query;

    const { defaultSkip, defaultTake, maxAllowedSize } = data;

    take = take && +take > 0 ? +take : defaultTake;
    console.log('take ne', take);

    take = +take < +maxAllowedSize ? take : maxAllowedSize;
    skip = skip && +skip > 0 ? +skip : defaultSkip;

    console.log('take ne', take, defaultTake, maxAllowedSize);

    return Object.assign(data, {
      skip,
      take,
      params,
    });
  },
);
