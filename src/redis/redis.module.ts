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
        url: appConfig.redisUrl,
      }),
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
