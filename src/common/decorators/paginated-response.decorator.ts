import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
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
import { PaginatedApiResponseDto } from '../dtos/paginated-response.dto';

export const PaginatedApiResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiQuery({ name: 'skip', type: 'number', required: false, example: '0' }),
    ApiQuery({ name: 'take', type: 'number', required: false, example: '10' }),
    ApiExtraModels(PaginatedApiResponseDto, model),
    ApiOkResponse({
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
                items: { $ref: getSchemaPath(model) },
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
    }),
    ApiUnauthorizedResponse({
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
    }),
    ApiForbiddenResponse({
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
    }),
    ApiNotFoundResponse({ description: 'Not found' }),
    ApiInternalServerErrorResponse({
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
    }),
  );
};
