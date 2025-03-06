import { GoogleCrawlerOption } from '@modules/crawler/crawler.enum';
import {
  PUPPETEER_KEY_PROVIDER,
  PuppeteerProvider,
} from '@modules/crawler/providers';
import {
  Inject,
  InternalServerErrorException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Browser, Page } from 'puppeteer';

export class PageManagementService implements OnModuleInit, OnModuleDestroy {
  private browser: Browser;

  constructor(
    @Inject(PUPPETEER_KEY_PROVIDER)
    private readonly puppeteerProvider: PuppeteerProvider,
  ) {}

  public async closePage(page: Page) {
    return page.close();
  }

  public async configPage(page: Page) {
    await Promise.all([
      page.setUserAgent(this.getRandomUserAgent()),
      page.setViewport(GoogleCrawlerOption.viewPort),
      page.setCookie(...GoogleCrawlerOption.cookies),
    ]);
  }

  public async getPageContent(page: Page) {
    return page.content();
  }

  public async launchNewPage() {
    if (!this.browser) {
      throw new InternalServerErrorException('Somethings wrong!');
    }

    return this.browser.newPage();
  }

  public async navigateToLink(link: string, page: Page) {
    return page.goto(link, {
      waitUntil: 'networkidle0',
    });
  }

  public async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  public async onModuleInit() {
    this.browser = await this.puppeteerProvider.launch({
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

  public async waitForSelector(
    selector: string,
    page: Page,
    timeout: number = 50000,
  ) {
    return page.waitForSelector(selector, {
      timeout,
    });
  }

  private getRandomUserAgent(): string {
    return GoogleCrawlerOption.userAgents[
      Math.floor(Math.random() * GoogleCrawlerOption.userAgents.length)
    ];
  }
}
