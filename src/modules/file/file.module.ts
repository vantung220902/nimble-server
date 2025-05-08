import { AppConfig } from '@config';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import * as useCases from './application';
import * as services from './services';

const applications = Object.values(useCases);
const endpoints = applications.filter((x) => x.name.endsWith('Endpoint'));
const handlers = applications.filter((x) => x.name.endsWith('Handler'));

const Services = [...Object.values(services)];

@Module({
  imports: [CqrsModule],
  controllers: [...endpoints],
  providers: [...Services, ...handlers, AppConfig],
  exports: [...Services],
})
export class FileModule {}
