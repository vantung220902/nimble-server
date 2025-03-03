import { loggerSchema } from '@logger/logger.config';
import Joi from 'joi';

describe('LoggerConfig', () => {
  afterEach(() => jest.clearAllMocks());

  describe('loggerSchema', () => {
    test('should default to info', () => {
      const loggerSchemaValidation = Joi.object(loggerSchema).validate({});

      expect(loggerSchemaValidation).toEqual({
        value: {
          LOG_LEVEL: 'info',
        },
      });
    });
  });
});
