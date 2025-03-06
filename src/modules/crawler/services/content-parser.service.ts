import { GoogleCrawlerOption } from '@modules/crawler/crawler.enum';
import { Injectable } from '@nestjs/common';
import { JSDOM } from 'jsdom';
import { Page } from 'puppeteer';

@Injectable()
export class ContentParserService {
  public countAdsFromDocument(document: Document): number {
    return GoogleCrawlerOption.adSelectors.reduce(
      (sum, selector) =>
        sum + (document.querySelectorAll(selector)?.length ?? 0),
      0,
    );
  }

  public async countAdsFromPage(page: Page): Promise<number> {
    return page.evaluate(
      (adSelectors) =>
        adSelectors.reduce(
          (sum, selector) =>
            sum + (document.querySelectorAll(selector)?.length ?? 0),
          0,
        ),
      GoogleCrawlerOption.adSelectors,
    );
  }

  public countLinksFromDocument(document: Document): number {
    return Array.from(document.querySelectorAll('a')).filter((a) =>
      a.hasAttribute('href'),
    ).length;
  }

  public async countLinksFromPage(page: Page): Promise<number> {
    return page.$$eval('a[href]', (links) => links.length);
  }

  public getDocumentContent(content: string): Document {
    return new JSDOM(content).window.document;
  }
}
