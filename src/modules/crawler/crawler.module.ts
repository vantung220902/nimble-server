import { Module } from '@nestjs/common';
import { CrawlerService } from './services';

@Module({
  imports: [],
  providers: [CrawlerService],
  exports: [CrawlerService],
})
export class CrawlerModule {}
