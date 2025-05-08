import { apiConfig, ApiConfig, apiSchema } from '@config';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import Joi from 'joi';

describe('ApiConfig', () => {
  describe('apiSchema', () => {
    it('Should use default value for schema properties', () => {
      const apiSchemaValidation = Joi.object(apiSchema).validate({});

      expect(apiSchemaValidation.value).toEqual({
        API_PREFIX: 'api-svc',
        API_VERSION: 'v1',
      });
    });

    it('Should pass validation on valid config', () => {
      const apiSchemaValidation = Joi.object(apiSchema).validate({
        API_PREFIX: 'api-svc',
        API_VERSION: 'v1',
      });

      expect(apiSchemaValidation.error).toBeUndefined();
    });

    it('Should return errors on invalid config', () => {
      const apiSchemaValidation = Joi.object(apiSchema).valid({
        API_PREFIX: 1,
        API_VERSION: 1,
      });

      expect(apiSchemaValidation.error).toBeDefined();
    });
  });

  describe('apiConfig', () => {
    process.env.API_PREFIX = 'api-svc';
    process.env.API_VERSION = 'v1';
    let moduleRef: TestingModule;

    afterEach(async () => {
      await moduleRef.close();
    });

    it('Should get value from env variables', async () => {
      moduleRef = await Test.createTestingModule({
        imports: [
          NestConfigModule.forRoot({
            load: [apiConfig],
          }),
        ],
        providers: [ApiConfig],
      }).compile();

      const config = moduleRef.get<ApiConfig>(ApiConfig);

      expect(config).toBeDefined();
      expect(config.prefix).toEqual('api-svc');
      expect(config.version).toEqual('v1');
    });

    it('Should return undefined when miss env variables', async () => {
      delete process.env.API_PREFIX;
      delete process.env.API_VERSION;

      moduleRef = await Test.createTestingModule({
        imports: [
          NestConfigModule.forRoot({
            load: [apiConfig],
          }),
        ],
        providers: [ApiConfig],
      }).compile();

      const config = moduleRef.get<ApiConfig>(ApiConfig);

      expect(config).toBeDefined();
      expect(config.prefix).toBeUndefined();
      expect(config.version).toBeUndefined();
    });
  });
});
