import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from '@database';
import { JwtModule } from '@nestjs/jwt';
import { AppConfig, ConfigModule } from '@config';
import { EmailModule } from '@email';
import { JwtStrategy } from '@common/strategies';

import * as useCases from './application';
import * as services from './services';

const applications = Object.values(useCases);
const endpoints = applications.filter((x) => x.name.endsWith('Endpoint'));
const handlers = applications.filter((x) => x.name.endsWith('Handler'));

const Services = [...Object.values(services), JwtStrategy];

@Module({
  imports: [
    CqrsModule,
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [AppConfig],
      useFactory: (appConfig: AppConfig) => {
        return {
          secret: appConfig.jwtSecret,
          signOptions: {
            expiresIn: appConfig.jwtExpiresIn,
          },
        };
      },
    }),
    EmailModule,
  ],
  controllers: [...endpoints],
  providers: [...Services, ...handlers],
  exports: [...Services],
})
export class AuthenticationModule {}
