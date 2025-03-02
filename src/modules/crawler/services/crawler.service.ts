import {
  EXPIRATION_KEYWORD_SECONDS,
  GoogleCrawlerOption,
} from '@modules/crawler/crawler.enum';
import { CrawledGoogleResponse } from '@modules/crawler/interfaces';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { Cache } from 'cache-manager';
import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

@Injectable()
export class CrawlerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CrawlerService.name);

  private browser: Browser;

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
  ) {
    puppeteer.use(StealthPlugin());
  }

  public async crawlKeyword(keyword: string): Promise<CrawledGoogleResponse> {
    this.logger.log(`Searching for keyword: ${keyword.toString()}`);

    const cacheKey = this.getCacheKey(keyword);
    const cachedResult =
      await this.cacheService.get<CrawledGoogleResponse>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    if (!this.browser) {
      throw new InternalServerErrorException('Somethings wrong!');
    }

    const page = await this.browser.newPage();
    try {
      await page.setUserAgent(this.getRandomUserAgent());

      await page.setViewport(GoogleCrawlerOption.viewPort);

      await page.setCookie(...GoogleCrawlerOption.cookies);

      await page.goto(
        `${GoogleCrawlerOption.link}/search?q=${encodeURIComponent(keyword)}`,
        {
          waitUntil: 'load',
        },
      );

      const htmlContent = await page.content();
      const totalAds = await this.countAds(page);
      const totalLinks = await this.countLinks(page);

      const crawledResponse = {
        totalAds,
        totalLinks,
        content: htmlContent,
      };

      await page.close();

      await this.cacheService.set(
        cacheKey,
        crawledResponse,
        EXPIRATION_KEYWORD_SECONDS,
      );

      return {
        totalAds,
        totalLinks,
        content: htmlContent,
      };
    } catch (error) {
      console.log('Error', error);
      await page.close();
    }
  }

  public async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  public async onModuleInit() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certificate-errors',
        '--ignore-certificate-errors-spki-list',
        '--disable-blink-features=AutomationControlled',
      ],
      ignoreHTTPSErrors: true,
    });
  }

  private async countAds(page: Page): Promise<number> {
    return await page.$$eval(
      GoogleCrawlerOption.primaryAdElement,
      (ads) => ads.length,
    );
  }

  private async countLinks(page: Page): Promise<number> {
    return await page.$$eval('a', (links) => links.length);
  }

  private getCacheKey(keyword: string): string {
    return `keywordResult:${keyword.toLowerCase().trim()}`;
  }

  private getRandomUserAgent(): string {
    return GoogleCrawlerOption.userAgents[
      Math.floor(Math.random() * GoogleCrawlerOption.userAgents.length)
    ];
  }
}
