import { appConfig, AppConfig, appSchema } from '@config';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import Joi from 'joi';

describe('AppConfig', () => {
  describe('appSchema', () => {
    test('should pass on valid config', () => {
      const appSchemaValidation = Joi.object(appSchema).validate({
        NODE_ENV: 'development',
        APP_NAME: 'NestJS App',
        APP_PORT: 5000,
        STAGE: 'dev',
        JWT_SECRET: 'secret',
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
        JWT_EXPIRES_IN: '3h',
        EMAIL_FORM: 'example@gmail.com',
        SENDGRID_API_KEY: 'api-key',
        WEB_URL: 'http://web.app.com',
        AWS_S3_STORAGE_BUCKET: 'userBucket',
        RE_CAPTCHA_API: 'api-key',
      });

      expect(appSchemaValidation.error).toBeUndefined();
    });

    test('get AppConfig from DI provider', async () => {
      process.env.NODE_ENV = 'local';
      process.env.APP_NAME = 'API Service';
      process.env.APP_PORT = '5000';
      process.env.STAGE = 'dev';
      process.env.JWT_SECRET = 'secret';
      process.env.REDIS_HOST = 'localhost';
      process.env.REDIS_PORT = '6379';
      process.env.JWT_EXPIRES_IN = '3h';
      process.env.EMAIL_FORM = 'example@gmail.com';
      process.env.SENDGRID_API_KEY = 'api-key';
      process.env.WEB_URL = 'http://web.app.com';
      process.env.AWS_S3_STORAGE_BUCKET = 'userBucket';
      process.env.RE_CAPTCHA_API = 'api-key';

      const testModule = await Test.createTestingModule({
        imports: [
          NestConfigModule.forRoot({
            load: [appConfig],
          }),
        ],
        providers: [AppConfig],
      }).compile();

      const config = testModule.get<AppConfig>(AppConfig);

      expect(config.name).toBe('API Service');
      expect(config.port).toBe(5000);
      expect(config.env).toBe('local');
      expect(config.stage).toBe('dev');
      expect(config.isLocal).toBe(true);
      expect(config.isProduction).toBe(false);
      expect(config.jwtSecret).toBe('secret');
      expect(config.jwtExpiresIn).toBe('3h');
      expect(config.redisHost).toEqual('localhost');
      expect(config.redisPort).toEqual(6379);
      expect(config.emailForm).toEqual('example@gmail.com');
      expect(config.sendGridApiKey).toEqual('api-key');
      expect(config.webUrl).toBe('http://web.app.com');
      expect(config.bucketS3Name).toEqual('userBucket');
      expect(config.reCaptchaApi).toBe('api-key');
    });

    afterAll(() => {
      process.env.NODE_ENV = undefined;
      process.env.APP_NAME = undefined;
      process.env.APP_PORT = undefined;
      process.env.STAGE = undefined;
      process.env.JWT_SECRET = undefined;
      process.env.REDIS_HOST = undefined;
      process.env.REDIS_PORT = undefined;
      process.env.JWT_EXPIRES_IN = undefined;
      process.env.EMAIL_FORM = undefined;
      process.env.SENDGRID_API_KEY = undefined;
      process.env.WEB_URL = undefined;
      process.env.AWS_S3_STORAGE_BUCKET = undefined;
      process.env.RE_CAPTCHA_API = undefined;
    });
  });
});
