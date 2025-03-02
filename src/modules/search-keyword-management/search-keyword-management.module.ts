import { DatabaseModule } from '@database';
import { CrawlerModule } from '@modules/crawler';
import { FileModule } from '@modules/file';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RedisModule } from '@redis';
import * as useCases from './application';
import * as services from './services';

const applications = Object.values(useCases);
const endpoints = applications.filter((x) => x.name.endsWith('Endpoint'));
const handlers = applications.filter((x) => x.name.endsWith('Handler'));

const Services = [...Object.values(services)];

@Module({
  imports: [CqrsModule, DatabaseModule, RedisModule, FileModule, CrawlerModule],
  controllers: [...endpoints],
  providers: [...Services, ...handlers],
  exports: [...Services],
})
export class SearchKeywordManagementModule {}
