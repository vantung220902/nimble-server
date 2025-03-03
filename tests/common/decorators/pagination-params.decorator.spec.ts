import { DefaultPagination, PaginationParams } from '@common/decorators';
import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { instance, mock, reset, when } from 'ts-mockito';

describe('PaginationParams', () => {
  function getParamDecoratorFactory() {
    class TestController {
      public testHTTPMethodImplementation(@PaginationParams() value: any) {
        void value;
      }
    }

    const args = Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      TestController,
      'testHTTPMethodImplementation',
    );
    return args[Object.keys(args)[0]].factory;
  }

  const mockReq = mock<any>();
  const mockRes = mock<any>();
  const mockHttpHost = mock<HttpArgumentsHost>();
  const mockContext = mock<ExecutionContext>();

  beforeEach(() => {
    when(mockContext.switchToHttp()).thenReturn(instance(mockHttpHost));
    when(mockHttpHost.getRequest()).thenReturn(instance(mockReq));
    when(mockHttpHost.getResponse()).thenReturn(instance(mockRes));
  });

  afterEach(() => {
    reset(mockReq, mockRes, mockHttpHost, mockContext);
  });

  test('should calculate pagination params from request query', () => {
    when(mockReq.query).thenReturn({
      skip: 200,
      take: 100,
    });

    const factory = getParamDecoratorFactory();
    const response = factory(undefined, instance(mockContext));
    expect(response).toEqual(
      expect.objectContaining({
        skip: 200,
        take: 100,
        params: {
          skip: 200,
          take: 100,
        },
      }),
    );
  });

  test('should use default take if not specified', () => {
    when(mockReq.query).thenReturn({
      skip: 200,
    });

    const factory = getParamDecoratorFactory();
    const defaultPagination: DefaultPagination = {
      defaultSkip: 0,
      defaultTake: 50,
      maxAllowedSize: 100,
    };
    const response = factory(defaultPagination, instance(mockContext));
    expect(response).toEqual(
      expect.objectContaining({
        skip: 200,
        take: 50,
        params: {
          skip: 200,
        },
      }),
    );
  });

  test('should respect maxAllowedSize when taking more than maxAllowedSize', () => {
    when(mockReq.query).thenReturn({
      skip: 200,
      take: 500,
    });

    const factory = getParamDecoratorFactory();
    const defaultPagination: DefaultPagination = {
      defaultSkip: 0,
      defaultTake: 50,
      maxAllowedSize: 100,
    };
    const response = factory(defaultPagination, instance(mockContext));
    expect(response).toEqual(
      expect.objectContaining({
        skip: 200,
        take: 100,
        params: {
          skip: 200,
          take: 500,
        },
      }),
    );
  });

  test('should use default skip if not specified', () => {
    when(mockReq.query).thenReturn({
      take: 100,
    });

    const factory = getParamDecoratorFactory();
    const defaultPagination: DefaultPagination = {
      defaultSkip: 0,
      defaultTake: 50,
      maxAllowedSize: 100,
    };
    const response = factory(defaultPagination, instance(mockContext));
    expect(response).toEqual(
      expect.objectContaining({
        skip: 0,
        take: 100,
        params: {
          take: 100,
        },
      }),
    );
  });
});
