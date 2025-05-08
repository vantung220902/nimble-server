import { DefaultPagination, PaginationParams } from '@common/decorators';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { ExecutionContext, HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Request, Response } from 'express';
import { instance, mock, reset, when } from 'ts-mockito';

describe('PaginationParams', () => {
  function getParamDecoratorFactory() {
    class TestController {
      public testHTTPMethodImplementation(@PaginationParams() _params: any) {}
    }

    const args = Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      TestController,
      'testHTTPMethodImplementation',
    );

    return args[Object.keys(args)[0]].factory;
  }

  const mockReq = mock<Request>();
  const mockRes = mock<Response>();
  const mockHttpHost = mock<HttpArgumentsHost>();
  const mockContext = mock<ExecutionContext>();

  beforeEach(() => {
    when(mockContext.switchToHttp()).thenReturn(instance(mockHttpHost));
    when(mockHttpHost.getRequest()).thenReturn(instance(mockReq));
    when(mockHttpHost.getResponse()).thenReturn(instance(mockRes));
  });

  afterEach(() => {
    reset<any>(mockRes, mockReq, mockContext, mockHttpHost);
  });

  it('Should calculate pagination params from request query', () => {
    const mockQuery = {
      skip: '200',
      take: '10',
    };
    when(mockReq.query).thenReturn(mockQuery);

    const factory = getParamDecoratorFactory();
    const paginationParam = factory(undefined, instance(mockContext));

    expect(paginationParam).toEqual(
      expect.objectContaining({
        skip: 200,
        take: 10,
        params: mockQuery,
      }),
    );
  });

  it('Should use default take if not specified', () => {
    const mockQuery = {
      skip: '200',
    };

    when(mockReq.query).thenReturn(mockQuery);

    const factory = getParamDecoratorFactory();
    const paginationParam = factory(undefined, instance(mockContext));

    expect(paginationParam).toEqual(
      expect.objectContaining({
        skip: 200,
        take: 10,
        params: mockQuery,
      }),
    );
  });

  it('Should use default take argument if not specified', () => {
    const mockQuery = {
      skip: '200',
    };
    when(mockReq.query).thenReturn(mockQuery);

    const factory = getParamDecoratorFactory();
    const defaultParams: DefaultPagination = {
      defaultTake: 20,
      maxAllowedSize: 100,
    };
    const paginationParam = factory(defaultParams, instance(mockContext));

    expect(paginationParam).toEqual(
      expect.objectContaining({
        skip: 200,
        take: defaultParams.defaultTake,
        params: mockQuery,
      }),
    );
  });

  it('Should use default skip if not specified', () => {
    const mockQuery = {
      take: '10',
    };
    when(mockReq.query).thenReturn(mockQuery);

    const factory = getParamDecoratorFactory();
    const paginationParam = factory(undefined, instance(mockContext));

    expect(paginationParam).toEqual(
      expect.objectContaining({
        skip: 0,
        take: 10,
        params: mockQuery,
      }),
    );
  });

  it('Should use default skip argument if not specified', () => {
    const mockQuery = {
      take: '10',
    };
    when(mockReq.query).thenReturn(mockQuery);

    const factory = getParamDecoratorFactory();
    const defaultParams: DefaultPagination = {
      defaultSkip: 20,
      defaultTake: 10,
      maxAllowedSize: 100,
    };
    const paginationParam = factory(defaultParams, instance(mockContext));

    expect(paginationParam).toEqual(
      expect.objectContaining({
        skip: defaultParams.defaultSkip,
        take: defaultParams.defaultTake,
        params: mockQuery,
      }),
    );
  });

  it('Should use maxAllowedSize when take params greater than maxAllowedSize', () => {
    const mockQuery = {
      take: '200',
      skip: '10',
    };
    when(mockReq.query).thenReturn(mockQuery);

    const factory = getParamDecoratorFactory();
    const paginationParam = factory(undefined, instance(mockContext));

    expect(paginationParam).toEqual(
      expect.objectContaining({
        skip: 10,
        take: 100,
        params: mockQuery,
      }),
    );
  });

  it('Should use maxAllowedSize argument if take params greater than maxAllowedSize', () => {
    const mockQuery = {
      take: '60',
      skip: '10',
    };
    when(mockReq.query).thenReturn(mockQuery);

    const factory = getParamDecoratorFactory();
    const defaultParams: DefaultPagination = {
      maxAllowedSize: 20,
    };
    const paginationParam = factory(defaultParams, instance(mockContext));

    expect(paginationParam).toEqual(
      expect.objectContaining({
        skip: 10,
        take: defaultParams.maxAllowedSize,
        params: mockQuery,
      }),
    );
  });
});
