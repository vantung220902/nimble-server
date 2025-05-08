import { ApiConfig, AppConfig, ConfigModule } from '@config';
import { Test, TestingModule } from '@nestjs/testing';

describe('ConfigModule', () => {
  let appConfig: AppConfig;
  let apiConfig: ApiConfig;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    process.env.API_PREFIX = 'api-svc';
    process.env.API_VERSION = 'v1';

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
      imports: [ConfigModule],
    }).compile();

    appConfig = moduleRef.get<AppConfig>(AppConfig);
    apiConfig = moduleRef.get<ApiConfig>(ApiConfig);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('Should load ConfigModule successfully', async () => {
    expect(apiConfig.prefix).toEqual('api-svc');
    expect(apiConfig.version).toEqual('v1');

    expect(appConfig.apiKey).toEqual('API_KEY');
    expect(appConfig.apiUrl).toEqual('API_URL');
    expect(appConfig.jwtSecret).toEqual('JWT_SECRET');
    expect(appConfig.jwtExpiresIn).toEqual('JWT_EXPIRES_IN');
    expect(appConfig.redisHost).toEqual('REDIS_HOST');
    expect(appConfig.redisPort).toEqual(6367);
    expect(appConfig.emailForm).toEqual('EMAIL_FORM');
    expect(appConfig.sendGridApiKey).toEqual('SENDGRID_API_KEY');
    expect(appConfig.webUrl).toEqual('WEB_URL');
    expect(appConfig.bucketS3Name).toEqual('AWS_S3_STORAGE_BUCKET');
    expect(appConfig.reCaptchaApi).toEqual('RE_CAPTCHA_API');
    expect(appConfig.env).toEqual('development');
    expect(appConfig.name).toEqual('API Service');
    expect(appConfig.port).toEqual(5000);
    expect(appConfig.stage).toEqual('dev');
  });

  it('Should be a global module', () => {
    const decorators = Reflect.getMetadataKeys(ConfigModule);
    expect(decorators).toContain('__module:global__');
  });

  it('Should throw error on invalid configuration', async () => {
    process.env = {};

    const invalidModule = await Test.createTestingModule({
      imports: [ConfigModule],
    }).compile();

    apiConfig = invalidModule.get<ApiConfig>(ApiConfig);
    appConfig = invalidModule.get<AppConfig>(AppConfig);

    expect(apiConfig.prefix).toBeUndefined();
    expect(apiConfig.version).toBeUndefined();

    expect(appConfig.apiKey).toBeUndefined();
    expect(appConfig.apiUrl).toBeUndefined();
    expect(appConfig.jwtSecret).toBeUndefined();
    expect(appConfig.jwtExpiresIn).toBeUndefined();
    expect(appConfig.redisHost).toBeUndefined();
    expect(appConfig.redisPort).toBeNaN();
    expect(appConfig.emailForm).toBeUndefined();
    expect(appConfig.sendGridApiKey).toBeUndefined();
    expect(appConfig.webUrl).toBeUndefined();
    expect(appConfig.bucketS3Name).toBeUndefined();
    expect(appConfig.reCaptchaApi).toBeUndefined();
    expect(appConfig.env).toBeUndefined();
    expect(appConfig.name).toBeUndefined();
    expect(appConfig.port).toBeNaN();
    expect(appConfig.stage).toBeUndefined();
  });
});
