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
    ApiQuery: jest.fn(),
    ApiUnauthorizedResponse: jest.fn(),
  };
});

class TestModule {
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}

describe('PaginatedApiResponse', () => {
  afterAll(() => jest.clearAllMocks());
  it('Should apply PaginatedApiResponse decorator', () => {
    PaginatedApiResponse(TestModule);

    expect(ApiQuery).toHaveBeenCalledTimes(2);
    expect(ApiQuery).toHaveBeenCalledWith({
      name: 'skip',
      type: 'number',
      required: false,
      example: '0',
    });
    expect(ApiQuery).toHaveBeenCalledWith({
      name: 'take',
      type: 'number',
      required: false,
      example: '10',
    });

    expect(ApiExtraModels).toHaveBeenCalledTimes(1);
    expect(ApiExtraModels).toHaveBeenCalledWith(
      PaginatedApiResponseDto,
      TestModule,
    );

    expect(ApiOkResponse).toHaveBeenCalledTimes(1);
    expect(ApiOkResponse).toHaveBeenCalledWith({
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
                items: { $ref: getSchemaPath(TestModule) },
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
            example: 1617826799860,
          },
          path: {
            type: 'string',
            example: '/api-svc/v1/uploaded-files',
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
            example: 1617826799860,
          },
          path: {
            type: 'string',
            example: '/api-svc/v1/uploaded-files',
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
