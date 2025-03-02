import { AppConfig, ConfigModule } from '@config';
import { DatabaseModule } from '@database';
import { EmailModule } from '@email';
import { HealthModule } from '@health';
import { createKeyv } from '@keyv/redis';
import { LoggerModule } from '@logger';
import { AuthenticationModule } from '@modules/authentication';
import { CrawlerModule } from '@modules/crawler';
import { FileModule } from '@modules/file';
import { SearchKeywordManagementModule } from '@modules/search-keyword-management';
import { UserAccessManagementModule } from '@modules/user-access-management';
import { RedisModule } from '@nestjs-modules/ioredis';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule,
    HealthModule,
    DatabaseModule,
    LoggerModule,
    AuthenticationModule,
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [AppConfig],
      useFactory: (appConfig: AppConfig) => ({
        stores: createKeyv(appConfig.redisUrl),
      }),
    }),
    EmailModule,
    UserAccessManagementModule,
    FileModule,
    RedisModule,
    SearchKeywordManagementModule,
    CrawlerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
