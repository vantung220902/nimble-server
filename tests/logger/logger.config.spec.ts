import { loggerSchema } from '@logger/logger.config';
import Joi from 'joi';

describe('LoggerConfig', () => {
  afterEach(() => jest.clearAllMocks());

  describe('loggerSchema', () => {
    test('should default to info', () => {
      const result = Joi.object(loggerSchema).validate({});

      expect(result).toEqual({
        value: {
          LOG_LEVEL: 'info',
        },
      });
    });
  });
});
