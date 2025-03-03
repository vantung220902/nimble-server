import { apiConfig, ApiConfig, apiSchema } from '@config';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import Joi from 'joi';

describe('ApiConfig', () => {
  describe('apiSchema', () => {
    test('should API_PREFIX default to api-svc and API_VERSION default to v1', () => {
      const result = Joi.object(apiSchema).validate({});

      expect(result.value).toEqual({
        API_VERSION: 'v1',
        API_PREFIX: 'api-svc',
      });
    });

    test('should pass on valid config', () => {
      const result = Joi.object(apiSchema).validate({
        API_VERSION: 'v1',
        API_PREFIX: 'api-svc',
      });

      expect(result.error).toBeUndefined();
    });
  });

  test('get ApiConfig from DI provider', async () => {
    process.env.API_PREFIX = 'foo';
    process.env.API_VERSION = 'v5';

    const module = await Test.createTestingModule({
      imports: [
        NestConfigModule.forRoot({
          load: [apiConfig],
        }),
      ],
      providers: [ApiConfig],
    }).compile();

    const config = module.get<ApiConfig>(ApiConfig);

    expect(config.prefix).toBe('foo');
    expect(config.version).toBe('v5');
  });
});
