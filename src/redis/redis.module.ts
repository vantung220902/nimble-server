import { AppConfig, ConfigModule } from '@config';
import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';
import { RedisService } from './services';

@Module({
  imports: [
    NestRedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [AppConfig],
      useFactory: (appConfig: AppConfig) => ({
        type: 'single',
        options: {
          port: appConfig.redisPort,
          host: appConfig.redisHost,
        },
      }),
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
