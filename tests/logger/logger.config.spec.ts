import {
  LoggerConfig,
  loggerConfig,
  loggerSchema,
} from '@logger/logger.config';
import { RequestMethod } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import Joi from 'joi';

describe('LoggerConfig', () => {
  describe('loggerSchema', () => {
    test('Should use default value for schema properties', () => {
      const loggerSchemaValidation = Joi.object(loggerSchema).validate({});

      expect(loggerSchemaValidation.value).toEqual({
        LOG_LEVEL: 'info',
      });
    });

    test('Should pass validation on valid config', () => {
      const loggerSchemaValidation = Joi.object(loggerSchema).validate({
        LOG_LEVEL: 'debug',
        LOG_EXCLUDE: `${RequestMethod.GET}::/test`,
      });

      expect(loggerSchemaValidation.value).toEqual({
        LOG_LEVEL: 'debug',
        LOG_EXCLUDE: `${RequestMethod.GET}::/test`,
      });
    });

    test.each([
      ['trace', true],
      ['debug', true],
      ['info', true],
      ['warn', true],
      ['error', true],
      ['test', false],
      ['foo', false],
    ])(
      'Should validate log level correctly %s, %s',
      (level: string, value: boolean) => {
        const loggerSchemaValidation = Joi.object(loggerSchema).validate({
          LOG_LEVEL: level,
        });

        expect(loggerSchemaValidation.error === undefined).toEqual(value);
      },
    );

    test('Should return error on invalid config', () => {
      const loggerSchemaValidation = Joi.object(loggerSchema).validate({
        LOG_LEVEL: 'test',
        LOG_EXCLUDE: `${RequestMethod.GET}::/test`,
      });

      expect(loggerSchemaValidation.error !== undefined).toEqual(true);
    });
  });

  describe('loggerConfig', () => {
    let moduleRef: TestingModule;

    beforeEach(() => {
      delete process.env.LOG_LEVEL;
      delete process.env.LOG_EXCLUDE;
    });

    afterEach(async () => {
      await moduleRef.close();
    });

    it('Should get value from environment variables', async () => {
      process.env.LOG_LEVEL = 'info';
      process.env.LOG_EXCLUDE = `GET::/test`;

      moduleRef = await Test.createTestingModule({
        imports: [
          NestConfigModule.forRoot({
            load: [loggerConfig],
          }),
        ],
        providers: [LoggerConfig],
      }).compile();
      const config = moduleRef.get<LoggerConfig>(LoggerConfig);
      console.log('config', config.exclude);

      expect(config).toBeDefined();
      expect(config.level).toEqual('info');
      expect(config.exclude).toHaveLength(1);
      expect(config.exclude[0]).toEqual({
        method: RequestMethod.GET,
        path: '/test',
      });
    });

    it('Should convert exclude string config correctly', async () => {
      process.env.LOG_LEVEL = 'info';
      process.env.LOG_EXCLUDE = `GET::/test,POST::/foo,PUT::/foo`;

      moduleRef = await Test.createTestingModule({
        imports: [
          NestConfigModule.forRoot({
            load: [loggerConfig],
          }),
        ],
        providers: [LoggerConfig],
      }).compile();
      const config = moduleRef.get<LoggerConfig>(LoggerConfig);

      expect(config).toBeDefined();
      expect(config.exclude).toHaveLength(3);
      process.env.LOG_EXCLUDE.split(',').forEach((exclude, index) => {
        const [method, path] = exclude.split('::');

        expect(config.exclude[`${index}`]).toEqual({
          method: RequestMethod[`${method}`],
          path,
        });
      });
    });

    it('Should handle missing environment variables', async () => {
      moduleRef = await Test.createTestingModule({
        imports: [
          NestConfigModule.forRoot({
            load: [loggerConfig],
            ignoreEnvFile: true,
          }),
        ],
        providers: [LoggerConfig],
      }).compile();
      const config = moduleRef.get<LoggerConfig>(LoggerConfig);
      expect(config).toBeDefined();
      expect(config.level).toBeUndefined();
      expect(config.exclude).toEqual([]);
    });
  });
});
