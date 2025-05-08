import { ApiConfig, AppConfig } from '@config';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { configureSwagger } from '@swagger';
import request from 'supertest';

describe('configureSwagger', () => {
  describe('configureSwaggerWithEnabled', () => {
    let app: INestApplication;
    let appConfig: AppConfig;
    let apiConfig: ApiConfig;
    let server;
    let moduleRef: TestingModule;

    beforeEach(async () => {
      moduleRef = await Test.createTestingModule({
        providers: [
          {
            provide: AppConfig,
            useValue: {
              name: 'Api-Svc',
              env: 'develop',
            },
          },
          {
            provide: ApiConfig,
            useValue: {
              prefix: 'api-svc',
              version: 'v1',
            },
          },
        ],
      }).compile();

      app = moduleRef.createNestApplication();
      appConfig = moduleRef.get<AppConfig>(AppConfig);
      apiConfig = moduleRef.get<ApiConfig>(ApiConfig);

      configureSwagger(app, apiConfig.version, apiConfig.prefix, (builder) => {
        builder
          .setTitle(`${appConfig.name} - ${appConfig.env}`)
          .setDescription(appConfig.name);
      });

      server = app.getHttpServer();
      await app.init();
    });

    afterEach(async () => {
      await app.close();
      await moduleRef.close();
    });

    it('Should handle swagger endpoint successfully', () => {
      return request(server).get(`/${apiConfig.prefix}/swagger`).expect(200);
    });

    it('Should handle swagger json endpoint successfully', async () => {
      const { body } = await request(server)
        .get(`/${apiConfig.prefix}/swagger-json`)
        .expect(200);

      expect(body.openapi).toEqual('3.0.0');
      expect(body.paths).toEqual({});
      expect(body.info).toEqual(
        expect.objectContaining({
          title: `${appConfig.name} - ${appConfig.env}`,
          description: appConfig.name,
          version: apiConfig.version,
        }),
      );

      expect(body.components).toEqual(
        expect.objectContaining({
          securitySchemes: {
            'X-API-KEY': {
              type: 'apiKey',
              name: 'X-API-KEY',
              in: 'header',
            },
            bearer: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'Bearer',
              name: 'access-token',
            },
          },
          schemas: {},
        }),
      );
    });
  });

  describe('configureSwaggerWithDisabled', () => {
    let app: INestApplication;
    let appConfig: AppConfig;
    let apiConfig: ApiConfig;
    let server;
    let moduleRef: TestingModule;

    beforeEach(async () => {
      moduleRef = await Test.createTestingModule({
        providers: [
          {
            provide: AppConfig,
            useValue: {
              name: 'Api-Svc',
              env: 'develop',
            },
          },
          {
            provide: ApiConfig,
            useValue: {
              prefix: 'api-svc',
              version: 'v1',
            },
          },
        ],
      }).compile();

      app = moduleRef.createNestApplication();
      appConfig = moduleRef.get<AppConfig>(AppConfig);
      apiConfig = moduleRef.get<ApiConfig>(ApiConfig);

      configureSwagger(
        app,
        apiConfig.version,
        apiConfig.prefix,
        (builder) => {
          builder
            .setTitle(`${appConfig.name} - ${appConfig.env}`)
            .setDescription(appConfig.name);
        },
        {
          disabled: true,
        },
      );

      server = app.getHttpServer();
      await app.init();
    });

    afterEach(async () => {
      await app.close();
      await moduleRef.close();
    });

    it('Should throw not found swagger endpoint when disable swagger config', () => {
      return request(server).get(`/${apiConfig.prefix}/swagger`).expect(404);
    });

    it('Should throw not found swagger json endpoint when disable swagger config', () => {
      return request(server)
        .get(`/${apiConfig.prefix}/swagger-json`)
        .expect(404);
    });
  });
});
