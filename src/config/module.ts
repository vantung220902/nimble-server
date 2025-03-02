import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { apiConfig, ApiConfig, apiSchema } from './api.config';
import { appConfig, AppConfig, appSchema } from './app.config';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, apiConfig,],
      validationSchema: Joi.object({
        ...appSchema,
        ...apiSchema,
      }),
      validationOptions: { abortEarly: true },
    }),
  ],
  providers: [AppConfig, ApiConfig],
  exports: [AppConfig, ApiConfig],
})
export class ConfigModule {}
