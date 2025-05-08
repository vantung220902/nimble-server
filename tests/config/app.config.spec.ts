import { AppConfig, appConfig, appSchema } from '@config';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import Joi from 'joi';

describe('AppConfig', () => {
  describe('appSchema', () => {
    beforeAll(() => {
      delete process.env.STAGE;
      delete process.env.APP_PORT;
      delete process.env.APP_NAME;
      delete process.env.NODE_ENV;
    });

    test.each([
      ['NODE_ENV', 'development'],
      ['APP_NAME', 'API Service'],
      ['APP_PORT', 5000],
      ['STAGE', 'dev'],
    ])('Should %s use %s as default value', (envVar: string, value: any) => {
      const appSchemaValidation = Joi.object(appSchema).validate({
        API_URL: 'test',
        API_KEY: 'test',
        JWT_SECRET: 'test',
        REDIS_HOST: 'test',
        REDIS_PORT: 6367,
        JWT_EXPIRES_IN: 'test',
        EMAIL_FORM: 'test',
        SENDGRID_API_KEY: 'test',
        WEB_URL: 'test',
        AWS_S3_STORAGE_BUCKET: 'test',
        RE_CAPTCHA_API: 'test',
      });

      expect(appSchemaValidation.value[`${envVar}`]).toEqual(value);
    });

    test.each([
      ['local', true],
      ['development', true],
      ['test', true],
      ['staging', true],
      ['production', true],
      ['uat', false],
      ['main', false],
      ['foo', false],
    ])(
      'Should validate environment config correctly %s, %s',
      (env: string, value: boolean) => {
        const appSchemaValidation = Joi.object(appSchema).validate({
          NODE_ENV: env,
        });

        expect(appSchemaValidation.error === undefined).toEqual(value);
      },
    );

    test.each([
      'API_URL',
      'API_KEY',
      'JWT_SECRET',
      'REDIS_HOST',
      'REDIS_PORT',
      'JWT_EXPIRES_IN',
      'EMAIL_FORM',
      'SENDGRID_API_KEY',
      'WEB_URL',
      'AWS_S3_STORAGE_BUCKET',
      'RE_CAPTCHA_API',
    ])('Should return errors on invalid %s value', (env: string) => {
      const appSchemaValidation = Joi.object(appSchema).validate({
        API_URL: 'test',
        API_KEY: 'test',
        JWT_SECRET: 'test',
        REDIS_HOST: 'test',
        REDIS_PORT: 6367,
        JWT_EXPIRES_IN: 'test',
        EMAIL_FORM: 'test',
        SENDGRID_API_KEY: 'test',
        WEB_URL: 'test',
        AWS_S3_STORAGE_BUCKET: 'test',
        RE_CAPTCHA_API: 'test',
        [env]: '',
      });

      expect(appSchemaValidation.error === undefined).toEqual(false);
    });

    test('Should pass validation on valid config', () => {
      const appSchemaValidation = Joi.object(appSchema).validate({
        API_URL: 'test',
        API_KEY: 'test',
        JWT_SECRET: 'test',
        REDIS_HOST: 'test',
        REDIS_PORT: 6367,
        JWT_EXPIRES_IN: 'test',
        EMAIL_FORM: 'test',
        SENDGRID_API_KEY: 'test',
        WEB_URL: 'test',
        AWS_S3_STORAGE_BUCKET: 'test',
        RE_CAPTCHA_API: 'test',
        NODE_ENV: 'development',
        APP_NAME: 'API Service',
        APP_PORT: 5000,
        STAGE: 'dev',
      });

      expect(appSchemaValidation.error).toBeUndefined();
      expect(appSchemaValidation.value).toEqual({
        API_URL: 'test',
        API_KEY: 'test',
        JWT_SECRET: 'test',
        REDIS_HOST: 'test',
        REDIS_PORT: 6367,
        JWT_EXPIRES_IN: 'test',
        EMAIL_FORM: 'test',
        SENDGRID_API_KEY: 'test',
        WEB_URL: 'test',
        AWS_S3_STORAGE_BUCKET: 'test',
        RE_CAPTCHA_API: 'test',
        NODE_ENV: 'development',
        APP_NAME: 'API Service',
        APP_PORT: 5000,
        STAGE: 'dev',
      });
    });
  });

  describe('appConfig', () => {
    let moduleRef: TestingModule;

    afterEach(async () => {
      await moduleRef.close();
    });

    it('Should get value from env variables', async () => {
      process.env.API_URL = 'API_URL';
      process.env.API_KEY = 'API_KEY';
      process.env.JWT_SECRET = 'JWT_SECRET';
      process.env.REDIS_HOST = 'REDIS_HOST';
      process.env.REDIS_PORT = '6367';
      process.env.JWT_EXPIRES_IN = 'JWT_EXPIRES_IN';
      process.env.EMAIL_FORM = 'EMAIL_FORM';
      process.env.SENDGRID_API_KEY = 'SENDGRID_API_KEY';
      process.env.WEB_URL = 'WEB_URL';
      process.env.AWS_S3_STORAGE_BUCKET = 'AWS_S3_STORAGE_BUCKET';
      process.env.RE_CAPTCHA_API = 'RE_CAPTCHA_API';
      process.env.NODE_ENV = 'development';
      process.env.APP_NAME = 'API Service';
      process.env.APP_PORT = '5000';
      process.env.STAGE = 'dev';

      moduleRef = await Test.createTestingModule({
        imports: [
          NestConfigModule.forRoot({
            load: [appConfig],
          }),
        ],
        providers: [AppConfig],
      }).compile();

      const config = moduleRef.get<AppConfig>(AppConfig);
      expect(config).toBeDefined();
      expect(config.apiKey).toEqual('API_KEY');
      expect(config.apiUrl).toEqual('API_URL');
      expect(config.jwtSecret).toEqual('JWT_SECRET');
      expect(config.jwtExpiresIn).toEqual('JWT_EXPIRES_IN');
      expect(config.redisHost).toEqual('REDIS_HOST');
      expect(config.redisPort).toEqual(6367);
      expect(config.emailForm).toEqual('EMAIL_FORM');
      expect(config.sendGridApiKey).toEqual('SENDGRID_API_KEY');
      expect(config.webUrl).toEqual('WEB_URL');
      expect(config.bucketS3Name).toEqual('AWS_S3_STORAGE_BUCKET');
      expect(config.reCaptchaApi).toEqual('RE_CAPTCHA_API');
      expect(config.env).toEqual('development');
      expect(config.name).toEqual('API Service');
      expect(config.port).toEqual(5000);
      expect(config.stage).toEqual('dev');
    });

    it('Should return undefined when miss env variables', async () => {
      delete process.env.API_URL;
      delete process.env.API_KEY;
      delete process.env.JWT_SECRET;
      delete process.env.REDIS_HOST;
      delete process.env.REDIS_PORT;
      delete process.env.JWT_EXPIRES_IN;
      delete process.env.EMAIL_FORM;
      delete process.env.SENDGRID_API_KEY;
      delete process.env.WEB_URL;
      delete process.env.AWS_S3_STORAGE_BUCKET;
      delete process.env.RE_CAPTCHA_API;
      delete process.env.NODE_ENV;
      delete process.env.APP_NAME;
      delete process.env.APP_PORT;
      delete process.env.STAGE;

      moduleRef = await Test.createTestingModule({
        imports: [
          NestConfigModule.forRoot({
            load: [appConfig],
            ignoreEnvFile: true,
          }),
        ],
        providers: [AppConfig],
      }).compile();

      const config = moduleRef.get<AppConfig>(AppConfig);
      expect(config).toBeDefined();
      expect(config.apiKey).toBeUndefined();
      expect(config.apiUrl).toBeUndefined();
      expect(config.jwtSecret).toBeUndefined();
      expect(config.jwtExpiresIn).toBeUndefined();
      expect(config.redisHost).toBeUndefined();
      expect(config.redisPort).toBeNaN();
      expect(config.emailForm).toBeUndefined();
      expect(config.sendGridApiKey).toBeUndefined();
      expect(config.webUrl).toBeUndefined();
      expect(config.bucketS3Name).toBeUndefined();
      expect(config.reCaptchaApi).toBeUndefined();
      expect(config.env).toBeUndefined();
      expect(config.name).toBeUndefined();
      expect(config.port).toBeNaN();
      expect(config.stage).toBeUndefined();
    });
  });
});
