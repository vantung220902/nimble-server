import { AppConfig } from '@config';
import { Module } from '@nestjs/common';
import * as services from './services';

const Services = Object.values(services);

@Module({
  imports: [],
  providers: [...Services, AppConfig],
  exports: [...Services],
})
export class EmailModule {}
