import { PaginatedApiResponse } from '@common/decorators';
import { PaginatedApiResponseDto } from '@common/dtos';
import { HttpStatus } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
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
    ApiQuery: jest.fn(),
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

describe('PaginatedApiResponseDecorator', () => {
  afterEach(() => jest.clearAllMocks());

  test('should apply swagger decorators', () => {
    PaginatedApiResponse(DummyModel);

    expect(ApiQuery).toBeCalledTimes(2);
    expect(ApiQuery).toBeCalledWith({
      name: 'skip',
      type: 'number',
      required: false,
      example: '0',
    });
    expect(ApiQuery).toBeCalledWith({
      name: 'take',
      type: 'number',
      required: false,
      example: '10',
    });

    expect(ApiExtraModels).toBeCalledTimes(1);
    expect(ApiExtraModels).toBeCalledWith(PaginatedApiResponseDto, DummyModel);

    expect(ApiOkResponse).toBeCalledTimes(1);
    expect(ApiOkResponse).toBeCalledWith({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedApiResponseDto) },
          {
            properties: {
              skippedRecords: {
                type: 'number',
              },
              totalRecords: {
                type: 'number',
              },
              records: {
                type: 'array',
                items: { $ref: getSchemaPath(DummyModel) },
              },
              payloadSize: {
                type: 'number',
              },
              hasNext: {
                type: 'boolean',
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
            example: 1617826799860,
          },
          path: {
            type: 'string',
            example: '/api-svc/v1/uploaded-files',
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
            example: 1617826799860,
          },
          path: {
            type: 'string',
            example: '/api-svc/v1/uploaded-files',
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
            example: 1617826799860,
          },
          path: {
            type: 'string',
            example: '/api-svc/v1/uploaded-files',
          },
        },
      },
    });
  });
});
