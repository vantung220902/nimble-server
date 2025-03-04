import { AppConfig } from '@config';
import { GoogleCrawlerOption } from '@modules/crawler/crawler.enum';
import { CrawlerService } from '@modules/crawler/services';
import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';

jest.mock('puppeteer-extra');
jest.mock('puppeteer-extra-plugin-stealth', () =>
  jest.fn(() => 'stealth-plugin'),
);
jest.mock('puppeteer-extra-plugin-recaptcha', () =>
  jest.fn(() => ({
    default: 'recaptcha-plugin',
  })),
);
jest.mock('@common/utils', () => ({
  waiter: jest.fn().mockResolvedValue(undefined),
}));

describe('CrawlerService', () => {
  let service: CrawlerService;
  let mockBrowser: Partial<Browser>;
  let mockPage: Partial<Page>;
  let mockConfig: { isProduction: boolean; reCaptchaApi: string };
  let mockAppConfig: AppConfig;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockConfig = {
      isProduction: false,
      reCaptchaApi: 'api-key',
    };

    mockAppConfig = {
      reCaptchaApi: mockConfig.reCaptchaApi,
      get isProduction() {
        return mockConfig.isProduction;
      },
    } as AppConfig;

    mockPage = {
      setUserAgent: jest.fn().mockResolvedValue(undefined),
      setViewport: jest.fn().mockResolvedValue(undefined),
      setCookie: jest.fn().mockResolvedValue(undefined),
      goto: jest.fn().mockResolvedValue(undefined),
      waitForSelector: jest.fn(),
      content: jest.fn().mockResolvedValue('<html>Nimble</html>'),
      close: jest.fn().mockResolvedValue(undefined),
      evaluate: jest.fn().mockResolvedValue(false),
      solveRecaptchas: jest.fn().mockResolvedValue({
        solutions: [],
        solved: true,
      }),
      $$eval: jest.fn().mockImplementation((selector) => {
        if (selector === GoogleCrawlerOption.linkTag)
          return Promise.resolve(10);
        return Promise.resolve(5);
      }),
    };

    mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn().mockResolvedValue(undefined),
    };

    (puppeteer.use as jest.Mock).mockReturnValue(puppeteer);
    (puppeteer.launch as jest.Mock).mockResolvedValue(mockBrowser);

    const testModule: TestingModule = await Test.createTestingModule({
      providers: [
        CrawlerService,
        {
          provide: AppConfig,
          useValue: mockAppConfig,
        },
      ],
    }).compile();

    service = testModule.get<CrawlerService>(CrawlerService);

    await service.onModuleInit();
  });

  describe('onModuleInit', () => {
    it('should initialize puppeteer browser', async () => {
      expect(puppeteer.use).toHaveBeenCalledTimes(2);
      expect(puppeteer.launch).toHaveBeenCalledWith({
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
    });
  });

  describe('onModuleDestroy', () => {
    it('should close the browser if it exists', async () => {
      await service.onModuleDestroy();
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('should not throw if browser does not exist', async () => {
      Object.defineProperty(service, 'browser', {
        value: undefined,
        writable: true,
      });

      await expect(service.onModuleDestroy()).resolves.not.toThrow();
    });
  });

  describe('crawlKeyword', () => {
    it('should throw InternalServerErrorException if browser is not initialized', async () => {
      Object.defineProperty(service, 'browser', {
        value: undefined,
        writable: true,
      });

      await expect(service.crawlKeyword('Nimble')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should crawl and return data for a given keyword', async () => {
      const crawledContent = await service.crawlKeyword('Nimble');

      expect(mockPage.setUserAgent).toHaveBeenCalled();
      expect(mockPage.setViewport).toHaveBeenCalledWith(
        GoogleCrawlerOption.viewPort,
      );
      expect(mockPage.setCookie).toHaveBeenCalledWith(
        ...GoogleCrawlerOption.cookies,
      );
      expect(mockPage.goto).toHaveBeenCalledWith(
        `${GoogleCrawlerOption.link}/search?q=${encodeURIComponent('Nimble')}`,
        { waitUntil: 'load' },
      );
      expect(mockPage.waitForSelector).toHaveBeenCalledWith(
        GoogleCrawlerOption.selector,
        { timeout: 50000 },
      );
      expect(mockPage.content).toHaveBeenCalled();
      expect(mockPage.$$eval).toHaveBeenCalledTimes(2);
      expect(mockPage.close).toHaveBeenCalled();

      expect(crawledContent).toEqual({
        totalAds: 5,
        totalLinks: 10,
        content: '<html>Nimble</html>',
        keyword: 'Nimble',
      });
    });

    it('should handle errors during crawling', async () => {
      mockPage.goto = jest
        .fn()
        .mockRejectedValue(new Error('Navigation failed'));

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const crawledContent = await service.crawlKeyword('Nimble');

      expect(consoleSpy).toHaveBeenCalledWith('Error', expect.any(Error));
      expect(mockPage.close).toHaveBeenCalled();
      expect(crawledContent).toBeUndefined();

      consoleSpy.mockRestore();
    });
  });

  describe('detectCaptcha', () => {
    it('should handle captcha when detected in production', async () => {
      mockConfig.isProduction = true;

      mockPage.evaluate = jest.fn().mockResolvedValue(true);

      await service['detectCaptcha'].call(service, mockPage);

      expect(mockPage.evaluate).toHaveBeenCalled();
      expect(mockPage.solveRecaptchas).toHaveBeenCalled();
    });

    it('should not solve captcha when not in production', async () => {
      mockConfig.isProduction = false;

      mockPage.evaluate = jest.fn().mockResolvedValue(true);

      await service['detectCaptcha'].call(service, mockPage);

      expect(mockPage.evaluate).toHaveBeenCalled();
      expect(mockPage.solveRecaptchas).not.toHaveBeenCalled();
    });
  });

  describe('private utility methods', () => {
    it('should count ads correctly', async () => {
      const countAds = await service['countAds'].call(service, mockPage);

      expect(countAds).toBe(5);
    });

    it('should count links correctly', async () => {
      const countLinks = await service['countLinks'].call(service, mockPage);

      expect(countLinks).toBe(10);
    });

    it('should return a random user agent', () => {
      const randomUserGent = service['getRandomUserAgent'].call(service);

      expect(typeof randomUserGent).toBe('string');
    });
  });
});
