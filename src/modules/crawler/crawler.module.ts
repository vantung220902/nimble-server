import { PuppeteerProvider } from '@modules/crawler/providers';
import { Module } from '@nestjs/common';
import {
  BotDetectionService,
  CaptchaDetectionService,
  ContentParserService,
  CrawlerService,
  PageManagementService,
} from './services';

@Module({
  imports: [],
  providers: [
    CrawlerService,
    {
      provide: BotDetectionService,
      useClass: CaptchaDetectionService,
    },
    PuppeteerProvider,
    ContentParserService,
    PageManagementService,
    CaptchaDetectionService,
  ],
  exports: [CrawlerService],
})
export class CrawlerModule {}
