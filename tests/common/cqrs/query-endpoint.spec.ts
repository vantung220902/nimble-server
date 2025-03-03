import {
  ControllerBase,
  QueryEndpoint as QueryEndpointBase,
} from '@common/cqrs';
import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

class MockQueryBus {}

class QueryEndpoint extends QueryEndpointBase {}

describe('QueryEndpointCQRS', () => {
  let queryEndpoint: QueryEndpoint;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [QueryEndpoint, { provide: QueryBus, useClass: MockQueryBus }],
    }).compile();

    queryEndpoint = moduleRef.get<QueryEndpoint>(QueryEndpoint);
  });

  it('should be defined', () => {
    expect(queryEndpoint).toBeDefined();
    expect(queryEndpoint).toBeInstanceOf(QueryEndpoint);
  });

  it('should extend ControllerBase', () => {
    expect(queryEndpoint).toBeInstanceOf(ControllerBase);
  });
});
