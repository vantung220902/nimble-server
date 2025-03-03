import { ApiListResponse, ApiResponse } from '@common/decorators';
import { ApiListResponseDto, ApiResponseDto } from '@common/dtos';
import { HttpStatus } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';

jest.mock('@nestjs/common', () => {
  const originalModule = jest.requireActual('@nestjs/common');
  return {
    ...originalModule,
    applyDecorators: jest.fn(),
  };
});

jest.mock('@nestjs/swagger', () => {
  const originalModule = jest.requireActual('@nestjs/swagger');
  return {
    ...originalModule,
    ApiExtraModels: jest.fn(),
    ApiOkResponse: jest.fn(),
    ApiUnauthorizedResponse: jest.fn(),
    ApiForbiddenResponse: jest.fn(),
    ApiNotFoundResponse: jest.fn(),
    ApiInternalServerErrorResponse: jest.fn(),
  };
});

class DummyModel {
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}

describe('ApiResponse', () => {
  afterEach(() => jest.clearAllMocks());

  test('should apply swagger decorators with model', () => {
    ApiResponse(DummyModel);

    expect(ApiExtraModels).toBeCalledTimes(1);
    expect(ApiExtraModels).toBeCalledWith(ApiResponseDto, DummyModel);

    expect(ApiOkResponse).toBeCalledTimes(1);
    expect(ApiOkResponse).toBeCalledWith({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              success: {
                type: 'boolean',
              },
              code: {
                type: 'number',
              },
              data: {
                $ref: getSchemaPath(DummyModel),
              },
              timestamp: {
                type: 'number',
              },
            },
          },
        ],
      },
    });

    expect(ApiUnauthorizedResponse).toBeCalledTimes(1);
    expect(ApiUnauthorizedResponse).toBeCalledWith({
      description: 'Not authenticated',
      schema: {
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          code: {
            type: 'number',
            example: HttpStatus.UNAUTHORIZED,
          },
          errorId: {
            type: 'string',
            example: 'UNAUTHORIZED',
          },
          message: {
            type: 'string',
            example: 'Unauthorized',
          },
          stack: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          timestamp: {
            type: 'number',
            example: 1740646277,
          },
          path: {
            type: 'string',
            example: '/api/v1/keywords',
          },
        },
      },
    });

    expect(ApiForbiddenResponse).toBeCalledTimes(1);
    expect(ApiForbiddenResponse).toBeCalledWith({
      description: 'Access denied',
      schema: {
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          code: {
            type: 'number',
            example: HttpStatus.FORBIDDEN,
          },
          errorId: {
            type: 'string',
            example: 'FORBIDDEN',
          },
          message: {
            type: 'string',
            example: 'Forbidden resource',
          },
          error: {
            type: 'string',
            example: 'Forbidden',
          },
          stack: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          timestamp: {
            type: 'number',
            example: 1740646277,
          },
          path: {
            type: 'string',
            example: '/api/v1/keywords',
          },
        },
      },
    });

    expect(ApiNotFoundResponse).toBeCalledTimes(1);
    expect(ApiNotFoundResponse).toBeCalledWith({ description: 'Not found' });

    expect(ApiInternalServerErrorResponse).toBeCalledTimes(1);
    expect(ApiInternalServerErrorResponse).toBeCalledWith({
      description: 'Server error',
      schema: {
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          code: {
            type: 'number',
            example: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          errorId: {
            type: 'string',
            example: 'INTERNAL_SERVER_ERROR',
          },
          message: {
            type: 'string',
            example: 'Internal server error',
          },
          error: {
            type: 'string',
            example: 'Error',
          },
          stack: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          timestamp: {
            type: 'number',
            example: 1740646277,
          },
          path: {
            type: 'string',
            example: '/api/v1/keywords',
          },
        },
      },
    });
  });

  test('should apply swagger decorators without model', () => {
    ApiResponse();

    expect(ApiOkResponse).toBeCalledTimes(1);
    expect(ApiOkResponse).toBeCalledWith({
      schema: {
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          code: {
            type: 'number',
            example: HttpStatus.OK,
          },
          timestamp: {
            type: 'number',
            example: 1740646277,
          },
        },
      },
    });

    expect(ApiUnauthorizedResponse).toBeCalledTimes(1);
    expect(ApiUnauthorizedResponse).toBeCalledWith({
      description: 'Not authenticated',
      schema: {
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          code: {
            type: 'number',
            example: HttpStatus.UNAUTHORIZED,
          },
          errorId: {
            type: 'string',
            example: 'UNAUTHORIZED',
          },
          message: {
            type: 'string',
            example: 'Unauthorized',
          },
          stack: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          timestamp: {
            type: 'number',
            example: 1740646277,
          },
          path: {
            type: 'string',
            example: '/api/v1/keywords',
          },
        },
      },
    });

    expect(ApiForbiddenResponse).toBeCalledTimes(1);
    expect(ApiForbiddenResponse).toBeCalledWith({
      description: 'Access denied',
      schema: {
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          code: {
            type: 'number',
            example: HttpStatus.FORBIDDEN,
          },
          errorId: {
            type: 'string',
            example: 'FORBIDDEN',
          },
          message: {
            type: 'string',
            example: 'Forbidden resource',
          },
          error: {
            type: 'string',
            example: 'Forbidden',
          },
          stack: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          timestamp: {
            type: 'number',
            example: 1740646277,
          },
          path: {
            type: 'string',
            example: '/api/v1/keywords',
          },
        },
      },
    });

    expect(ApiNotFoundResponse).toBeCalledTimes(1);
    expect(ApiNotFoundResponse).toBeCalledWith({ description: 'Not found' });

    expect(ApiInternalServerErrorResponse).toBeCalledTimes(1);
    expect(ApiInternalServerErrorResponse).toBeCalledWith({
      description: 'Server error',
      schema: {
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          code: {
            type: 'number',
            example: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          errorId: {
            type: 'string',
            example: 'INTERNAL_SERVER_ERROR',
          },
          message: {
            type: 'string',
            example: 'Internal server error',
          },
          error: {
            type: 'string',
            example: 'Error',
          },
          stack: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          timestamp: {
            type: 'number',
            example: 1740646277,
          },
          path: {
            type: 'string',
            example: '/api/v1/keywords',
          },
        },
      },
    });
  });
});

describe('ApiListResponse', () => {
  afterEach(() => jest.clearAllMocks());

  test('should apply swagger decorators', () => {
    ApiListResponse(DummyModel);

    expect(ApiExtraModels).toBeCalledTimes(1);
    expect(ApiExtraModels).toBeCalledWith(ApiListResponseDto, DummyModel);

    expect(ApiOkResponse).toBeCalledTimes(1);
    expect(ApiOkResponse).toBeCalledWith({
      schema: {
        title: `ListResponseOf${DummyModel.name}`,
        allOf: [
          { $ref: getSchemaPath(ApiListResponseDto) },
          {
            properties: {
              success: {
                type: 'boolean',
              },
              code: {
                type: 'number',
                example: HttpStatus.OK,
              },
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(DummyModel) },
              },
              timestamp: {
                type: 'number',
              },
            },
          },
        ],
      },
    });

    expect(ApiUnauthorizedResponse).toBeCalledTimes(1);
    expect(ApiUnauthorizedResponse).toBeCalledWith({
      description: 'Not authenticated',
      schema: {
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          code: {
            type: 'number',
            example: HttpStatus.UNAUTHORIZED,
          },
          errorId: {
            type: 'string',
            example: 'UNAUTHORIZED',
          },
          message: {
            type: 'string',
            example: 'Unauthorized',
          },
          stack: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          timestamp: {
            type: 'number',
            example: 1740646277,
          },
          path: {
            type: 'string',
            example: '/api/v1/keywords',
          },
        },
      },
    });

    expect(ApiForbiddenResponse).toBeCalledTimes(1);
    expect(ApiForbiddenResponse).toBeCalledWith({
      description: 'Access denied',
      schema: {
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          code: {
            type: 'number',
            example: HttpStatus.FORBIDDEN,
          },
          errorId: {
            type: 'string',
            example: 'FORBIDDEN',
          },
          message: {
            type: 'string',
            example: 'Forbidden resource',
          },
          error: {
            type: 'string',
            example: 'Forbidden',
          },
          stack: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          timestamp: {
            type: 'number',
            example: 1740646277,
          },
          path: {
            type: 'string',
            example: '/api/v1/keywords',
          },
        },
      },
    });

    expect(ApiNotFoundResponse).toBeCalledTimes(1);
    expect(ApiNotFoundResponse).toBeCalledWith({ description: 'Not found' });

    expect(ApiInternalServerErrorResponse).toBeCalledTimes(1);
    expect(ApiInternalServerErrorResponse).toBeCalledWith({
      description: 'Server error',
      schema: {
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          code: {
            type: 'number',
            example: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          errorId: {
            type: 'string',
            example: 'INTERNAL_SERVER_ERROR',
          },
          message: {
            type: 'string',
            example: 'Internal server error',
          },
          error: {
            type: 'string',
            example: 'Error',
          },
          stack: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          timestamp: {
            type: 'number',
            example: 1740646277,
          },
          path: {
            type: 'string',
            example: '/api/v1/keywords',
          },
        },
      },
    });
  });
});
