import { QueryHandlerBase } from '@common/cqrs';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

class MockIQuery {}
class MockQueryResponse {}

class TestQueryHandlerBase extends QueryHandlerBase<
  MockIQuery,
  MockQueryResponse
> {
  public execute(_query: MockIQuery): Promise<MockQueryResponse> {
    return;
  }
}

describe('QueryHandlerBase', () => {
  let queryHandlerBase: TestQueryHandlerBase;
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: QueryHandlerBase,
          useClass: TestQueryHandlerBase,
        },
      ],
    }).compile();

    queryHandlerBase = moduleRef.get<TestQueryHandlerBase>(QueryHandlerBase);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('Should be defined', () => {
    expect(queryHandlerBase).toBeDefined();
    expect(queryHandlerBase).toBeInstanceOf(QueryHandlerBase);
  });

  it('Should have logger instance exists', () => {
    expect(queryHandlerBase['logger']).toBeDefined();
    expect(queryHandlerBase['logger']).toBeInstanceOf(Logger);
  });
});
