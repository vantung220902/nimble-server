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
  const original = jest.requireActual('@nestjs/common');

  return {
    ...original,
    applyDecorators: jest.fn(),
  };
});

jest.mock('@nestjs/swagger', () => {
  const original = jest.requireActual('@nestjs/swagger');

  return {
    ...original,
    ApiExtraModels: jest.fn(),
    ApiForbiddenResponse: jest.fn(),
    ApiInternalServerErrorResponse: jest.fn(),
    ApiNotFoundResponse: jest.fn(),
    ApiOkResponse: jest.fn(),
    ApiUnauthorizedResponse: jest.fn(),
  };
});

class TestModel {
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}

describe('ApiResponse', () => {
  afterEach(() => jest.clearAllMocks());

  it('Should apply ApiResponse decorator with model', () => {
    ApiResponse(TestModel);

    expect(ApiExtraModels).toHaveBeenCalledTimes(1);
    expect(ApiExtraModels).toHaveBeenCalledWith(ApiResponseDto, TestModel);

    expect(ApiOkResponse).toHaveBeenCalledTimes(1);
    expect(ApiOkResponse).toHaveBeenCalledWith({
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
                $ref: getSchemaPath(TestModel),
              },
              timestamp: {
                type: 'number',
              },
            },
          },
        ],
      },
    });

    expect(ApiUnauthorizedResponse).toHaveBeenCalledTimes(1);
    expect(ApiUnauthorizedResponse).toHaveBeenCalledWith({
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

    expect(ApiForbiddenResponse).toHaveBeenCalledTimes(1);
    expect(ApiForbiddenResponse).toHaveBeenCalledWith({
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

    expect(ApiNotFoundResponse).toHaveBeenCalledTimes(1);
    expect(ApiNotFoundResponse).toHaveBeenCalledWith({
      description: 'Not found',
    });

    expect(ApiInternalServerErrorResponse).toHaveBeenCalledTimes(1);
    expect(ApiInternalServerErrorResponse).toHaveBeenCalledWith({
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

  it('Should apply ApiResponse decorator without model', () => {
    ApiResponse();

    expect(ApiOkResponse).toHaveBeenCalledTimes(1);
    expect(ApiOkResponse).toHaveBeenCalledWith({
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

    expect(ApiUnauthorizedResponse).toHaveBeenCalledTimes(1);
    expect(ApiUnauthorizedResponse).toHaveBeenCalledWith({
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

    expect(ApiForbiddenResponse).toHaveBeenCalledTimes(1);
    expect(ApiForbiddenResponse).toHaveBeenCalledWith({
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

    expect(ApiNotFoundResponse).toHaveBeenCalledTimes(1);
    expect(ApiNotFoundResponse).toHaveBeenCalledWith({
      description: 'Not found',
    });

    expect(ApiInternalServerErrorResponse).toHaveBeenCalledTimes(1);
    expect(ApiInternalServerErrorResponse).toHaveBeenCalledWith({
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

  it('Should apply ApiListResponse decorator', () => {
    ApiListResponse(TestModel);

    expect(ApiExtraModels).toHaveBeenCalledTimes(1);
    expect(ApiExtraModels).toHaveBeenCalledWith(ApiListResponseDto, TestModel);

    expect(ApiOkResponse).toHaveBeenCalledTimes(1);
    expect(ApiOkResponse).toHaveBeenCalledWith({
      schema: {
        title: `ListResponseOf${TestModel.name}`,
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
                items: { $ref: getSchemaPath(TestModel) },
              },
              timestamp: {
                type: 'number',
              },
            },
          },
        ],
      },
    });

    expect(ApiUnauthorizedResponse).toHaveBeenCalledTimes(1);
    expect(ApiUnauthorizedResponse).toHaveBeenCalledWith({
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

    expect(ApiForbiddenResponse).toHaveBeenCalledTimes(1);
    expect(ApiForbiddenResponse).toHaveBeenCalledWith({
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

    expect(ApiNotFoundResponse).toHaveBeenCalledTimes(1);
    expect(ApiNotFoundResponse).toHaveBeenCalledWith({
      description: 'Not found',
    });

    expect(ApiInternalServerErrorResponse).toHaveBeenCalledTimes(1);
    expect(ApiInternalServerErrorResponse).toHaveBeenCalledWith({
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
