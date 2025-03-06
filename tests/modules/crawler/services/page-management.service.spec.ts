import { GoogleCrawlerOption } from '@modules/crawler/crawler.enum';
import { PUPPETEER_KEY_PROVIDER } from '@modules/crawler/providers';
import { PageManagementService } from '@modules/crawler/services';
import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Browser, Page } from 'puppeteer';

describe('PageManagementService', () => {
  let service: PageManagementService;
  let mockPuppeteerProvider: { launch: jest.Mock };
  let mockBrowser: jest.Mocked<Browser>;
  let mockPage: jest.Mocked<Page>;

  const mockContent = `<html><div id='search'>Nimble</div></html>`;

  beforeEach(async () => {
    mockPage = {
      close: jest.fn().mockResolvedValue(undefined),
      setUserAgent: jest.fn().mockResolvedValue(undefined),
      setViewport: jest.fn().mockResolvedValue(undefined),
      setCookie: jest.fn().mockResolvedValue(undefined),
      content: jest.fn().mockResolvedValue(mockContent),
      goto: jest.fn().mockResolvedValue(undefined),
      waitForSelector: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Page>;

    mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Browser>;

    mockPuppeteerProvider = {
      launch: jest.fn().mockResolvedValue(mockBrowser),
    };

    const testModule: TestingModule = await Test.createTestingModule({
      providers: [
        PageManagementService,
        {
          provide: PUPPETEER_KEY_PROVIDER,
          useValue: mockPuppeteerProvider,
        },
      ],
    }).compile();

    service = testModule.get<PageManagementService>(PageManagementService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should initialize browser with correct options', async () => {
      await service.onModuleInit();

      expect(mockPuppeteerProvider.launch).toHaveBeenCalledWith({
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
    it('should close browser if it exists', async () => {
      await service.onModuleInit();
      await service.onModuleDestroy();

      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('should not throw if browser does not exist', async () => {
      await expect(service.onModuleDestroy()).resolves.not.toThrow();
    });
  });

  describe('launchNewPage', () => {
    it('should launch new page when browser exists', async () => {
      await service.onModuleInit();
      const page = await service.launchNewPage();

      expect(page).toBe(mockPage);
      expect(mockBrowser.newPage).toHaveBeenCalled();
    });

    it('should throw error when browser does not exist', async () => {
      await expect(service.launchNewPage()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('configPage', () => {
    it('should configure page with correct settings', async () => {
      await service.configPage(mockPage);

      expect(mockPage.setUserAgent).toHaveBeenCalled();
      expect(mockPage.setViewport).toHaveBeenCalledWith(
        GoogleCrawlerOption.viewPort,
      );
      expect(mockPage.setCookie).toHaveBeenCalledWith(
        ...GoogleCrawlerOption.cookies,
      );
    });
  });

  describe('navigateToLink', () => {
    it('should navigate to link with correct options', async () => {
      const testLink = 'https://www.google.com';
      await service.navigateToLink(testLink, mockPage);

      expect(mockPage.goto).toHaveBeenCalledWith(testLink, {
        waitUntil: 'networkidle0',
      });
    });
  });

  describe('getPageContent', () => {
    it('should return page content', async () => {
      const content = await service.getPageContent(mockPage);

      expect(content).toBe(mockContent);
      expect(mockPage.content).toHaveBeenCalled();
    });
  });

  describe('waitForSelector', () => {
    it('should wait for selector with default timeout', async () => {
      const selector = '#search';
      await service.waitForSelector(selector, mockPage);

      expect(mockPage.waitForSelector).toHaveBeenCalledWith(selector, {
        timeout: 50000,
      });
    });

    it('should wait for selector with custom timeout', async () => {
      const selector = '#search';
      const timeout = 10000;
      await service.waitForSelector(selector, mockPage, timeout);

      expect(mockPage.waitForSelector).toHaveBeenCalledWith(selector, {
        timeout,
      });
    });
  });

  describe('getRandomUserAgent', () => {
    it('should return a valid user agent', () => {
      const userAgent = service['getRandomUserAgent']();
      expect(GoogleCrawlerOption.userAgents).toContain(userAgent);
    });
  });
});
