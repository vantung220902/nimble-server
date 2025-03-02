import { waiter } from '@common/utils';
import { AppConfig } from '@config';
import { GoogleCrawlerOption } from '@modules/crawler/crawler.enum';
import { CrawledGoogleResponse } from '@modules/crawler/interfaces';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

@Injectable()
export class CrawlerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CrawlerService.name);

  private browser: Browser;

  constructor(private readonly appConfig: AppConfig) {
    puppeteer.use(StealthPlugin());

    puppeteer.use(
      RecaptchaPlugin({
        provider: {
          id: '2captcha',
          token: this.appConfig.reCaptchaApi,
        },
        visualFeedback: true,
      }),
    );
  }

  private async detectCaptcha(page: Page) {
    const isCaptchaPresent = await page.evaluate(
      () =>
        document.querySelector('form[action*="captcha"]') !== null ||
        document.querySelector('.g-recaptcha') !== null,
    );
    if (isCaptchaPresent) {
      this.logger.warn('CAPTCHA detected!');

      if (!this.appConfig.isLocal) {
        await page.solveRecaptchas();
        await waiter(2000);
      }
    }
  }

  public async crawlKeyword(keyword: string): Promise<CrawledGoogleResponse> {
    this.logger.log(`Searching for keyword: ${keyword.toString()}`);

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

      await this.detectCaptcha(page);

      const content = await page.content();
      const totalAds = await this.countAds(page);
      const totalLinks = await this.countLinks(page);

      const crawledResponse = {
        totalAds,
        totalLinks,
        content,
        keyword,
      };

      await page.close();

      return crawledResponse;
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

  private getRandomUserAgent(): string {
    return GoogleCrawlerOption.userAgents[
      Math.floor(Math.random() * GoogleCrawlerOption.userAgents.length)
    ];
  }
}
