import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import * as useCases from './application';
import { DatabaseModule } from '@database';

const applications = Object.values(useCases);
const endpoints = applications.filter((x) => x.name.endsWith('Endpoint'));
const handlers = applications.filter((x) => x.name.endsWith('Handler'));

const Services = [];

@Module({
  imports: [CqrsModule, DatabaseModule],
  controllers: [...endpoints],
  providers: [...Services, ...handlers],
  exports: [],
})
export class MeModule {}
