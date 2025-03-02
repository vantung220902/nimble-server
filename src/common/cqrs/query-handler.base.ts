import { Injectable, Logger } from '@nestjs/common';
import { IQuery, IQueryHandler } from '@nestjs/cqrs';

@Injectable()
export abstract class QueryHandlerBase<TQuery extends IQuery, TQueryResponse>
  implements IQueryHandler<TQuery, TQueryResponse>
{
  protected readonly logger: Logger = new Logger(this.constructor.name);

  public abstract execute(query: TQuery): Promise<TQueryResponse>;
}
