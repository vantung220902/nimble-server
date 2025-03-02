import { GoogleCrawlerOption } from '@modules/crawler/crawler.enum';
import { CrawledGoogleResponse } from '@modules/crawler/interfaces';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Page, executablePath } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
puppeteer.use(StealthPlugin());

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);

  public async crawlGoogle(keyword: string): Promise<CrawledGoogleResponse> {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--disable-setuid-sandbox',
        '--ignore-certificate-errors',
        '--no-sandbox',
      ],
      executablePath: executablePath() || '/usr/bin/google-chrome',
    });

    const generateUserAgent = new UserAgent();

    const page = await browser.newPage();

    try {
      await page.setUserAgent(generateUserAgent.toString());
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
      });

      await page.goto(
        `${GoogleCrawlerOption.link}/search?key=${encodeURIComponent(keyword)}`,
        {
          waitUntil: 'load',
        },
      );

      await this.detectCaptcha(page);

      try {
        await page.waitForSelector(GoogleCrawlerOption.selector);
      } catch (selectorError) {
        await this.detectCaptcha(page);

        await page.close();
        await browser.close();
        throw selectorError;
      }

      await page.evaluate(
        () =>
          new Promise((resolve) =>
            setTimeout(resolve, 2000 + Math.random() * 3000),
          ),
      );

      const [ads, links, htmlContent] = await Promise.all([
        page.$$eval(GoogleCrawlerOption.primaryAdElement, (adElements) =>
          adElements.map((ad) => ad.innerHTML),
        ),
        page.$$eval('a', (linkElements) =>
          linkElements.map((link) => link.href),
        ),
        page.content(),
      ]);

      await page.close();
      await browser.close();

      return {
        content: htmlContent,
        totalAds: ads.length,
        totalLinks: links.length,
      };
    } catch (error) {
      await page.close();
      await browser.close();
      this.logger.error(
        `CrawlerService crawlGoogle Error: ${JSON.stringify(error, null, 5)}`,
      );
      throw new InternalServerErrorException(
        `Crawl ${keyword} keyword failed: ${error.message}`,
      );
    }
  }

  private async detectCaptcha(page: Page) {
    const isCaptchaPresent = await page.evaluate(
      () =>
        document.querySelector('form[action*="captcha"]') !== null ||
        document.querySelector('.g-recaptcha') !== null,
    );
    if (isCaptchaPresent) {
      this.logger.warn('CAPTCHA detected!');
      throw new InternalServerErrorException('Google CAPTCHA detected');
    }
  }
}
