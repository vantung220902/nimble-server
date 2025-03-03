import { QueryHandlerBase } from '@common/cqrs';
import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

class MockQueryBus {}

class IQuery {}
class TQueryResponse {}

class QueryHandler extends QueryHandlerBase<IQuery, TQueryResponse> {
  public execute(_query: IQuery): Promise<TQueryResponse> {
    return;
  }
}

describe('QueryHandlerCQRS', () => {
  let queryHandler: QueryHandler;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [QueryHandler, { provide: QueryBus, useClass: MockQueryBus }],
    }).compile();

    queryHandler = moduleRef.get<QueryHandler>(QueryHandler);
  });

  it('should be defined', () => {
    expect(queryHandler).toBeDefined();
    expect(queryHandler).toBeInstanceOf(QueryHandler);
  });
});
