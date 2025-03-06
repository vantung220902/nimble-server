import { waiter } from '@common/utils';
import { AppConfig } from '@config';
import { GoogleCrawlerOption } from '@modules/crawler/crawler.enum';
import { CrawledGoogleResponse } from '@modules/crawler/interfaces';
import {
  CaptchaDetectionService,
  ContentParserService,
  PageManagementService,
} from '@modules/crawler/services';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);

  constructor(
    private readonly pageManagementService: PageManagementService,
    private readonly captchaDetectionService: CaptchaDetectionService,
    private readonly contentParserService: ContentParserService,
    private readonly appConfig: AppConfig,
  ) {}

  public async crawlKeyword(keyword: string): Promise<CrawledGoogleResponse> {
    this.logger.log(`Searching for keyword: ${keyword.toString()}`);

    const page = await this.pageManagementService.launchNewPage();
    try {
      const searchLink = `${GoogleCrawlerOption.link}/search?q=${encodeURIComponent(keyword)}`;
      await this.pageManagementService.configPage(page);
      await this.pageManagementService.navigateToLink(searchLink, page);

      const isCaptchaDetected = await this.captchaDetectionService.detect(page);
      if (isCaptchaDetected && this.appConfig.isProduction) {
        await this.captchaDetectionService.resolve(page);
      }

      await waiter(2000);

      await this.pageManagementService.waitForSelector(
        GoogleCrawlerOption.selector,
        page,
      );

      const content = await this.pageManagementService.getPageContent(page);

      const documentElement =
        this.contentParserService.getDocumentContent(content);
      const totalAds =
        this.contentParserService.countAdsFromDocument(documentElement);
      const totalLinks =
        this.contentParserService.countLinksFromDocument(documentElement);

      const crawledResponse = {
        totalAds,
        totalLinks,
        content,
        keyword,
      };

      await this.pageManagementService.closePage(page);

      return crawledResponse;
    } catch (error) {
      console.log('Error', error);

      console.log(
        `CrawlerService crawlKeyword error: ${JSON.stringify(error, null, 5)}`,
      );
      await this.pageManagementService.closePage(page);
    }
  }
}
