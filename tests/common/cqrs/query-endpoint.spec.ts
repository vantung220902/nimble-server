import { QueryEndpoint } from '@common/cqrs';
import { Logger } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

class MockQueryBus {}
class TestQueryEndpoint extends QueryEndpoint {}

describe('QueryEndpoint', () => {
  let queryEndpoint: QueryEndpoint;
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        { provide: QueryBus, useClass: MockQueryBus },
        { provide: QueryEndpoint, useClass: TestQueryEndpoint },
      ],
    }).compile();
    queryEndpoint = moduleRef.get<QueryEndpoint>(QueryEndpoint);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('Should be defined', () => {
    expect(queryEndpoint).toBeDefined();
    expect(queryEndpoint).toBeInstanceOf(QueryEndpoint);
  });

  it('Should have logger instance exists', () => {
    expect(queryEndpoint['logger']).toBeDefined();
    expect(queryEndpoint['logger']).toBeInstanceOf(Logger);
  });

  it('Should have queryBus argument exits', () => {
    expect(queryEndpoint['queryBus']).toBeDefined();
  });
});
