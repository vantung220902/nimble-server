import { GoogleCrawlerOption } from '@modules/crawler/crawler.enum';
import { PUPPETEER_KEY_PROVIDER } from '@modules/crawler/providers';
import { PageManagementService } from '@modules/crawler/services';
import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Browser, Page } from 'puppeteer';
import { PuppeteerExtra } from 'puppeteer-extra';

describe('PageManagementService', () => {
  let service: PageManagementService;
  let moduleRef: TestingModule;

  const mockContent = `<html><div id='search'>Nimble</div></html>`;
  const mockPage = {
    close: jest.fn(),
    setUserAgent: jest.fn(),
    setViewport: jest.fn(),
    setCookie: jest.fn(),
    content: jest.fn().mockResolvedValue(mockContent),
    goto: jest.fn(),
    waitForSelector: jest.fn(),
  } as unknown as jest.Mocked<Page>;
  let mockBrowser: jest.Mocked<Browser>;
  let mockPuppeteerProvider: jest.Mocked<PuppeteerExtra>;

  beforeEach(async () => {
    mockBrowser = {
      close: jest.fn(),
      newPage: jest.fn().mockResolvedValue(mockPage),
    } as unknown as jest.Mocked<Browser>;
    mockPuppeteerProvider = {
      launch: jest.fn().mockResolvedValue(mockBrowser),
    } as unknown as jest.Mocked<PuppeteerExtra>;

    moduleRef = await Test.createTestingModule({
      providers: [
        PageManagementService,
        {
          provide: PUPPETEER_KEY_PROVIDER,
          useValue: mockPuppeteerProvider,
        },
      ],
    }).compile();

    service = moduleRef.get(PageManagementService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await moduleRef.close();
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('Should initialize browser correctly', async () => {
      await service.onModuleInit();

      expect(mockPuppeteerProvider.launch).toHaveBeenCalledTimes(1);
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

    it('Should throw error if browser launch failed', async () => {
      mockPuppeteerProvider.launch.mockRejectedValueOnce(
        new Error('Something Wrong!'),
      );

      await expect(service.onModuleInit()).rejects.toThrow(
        new Error('Something Wrong!'),
      );
    });
  });

  describe('onModuleDestroy', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('Should close browser if existed', async () => {
      await service.onModuleInit();
      await service.onModuleDestroy();

      expect(mockBrowser.close).toHaveBeenCalledTimes(1);
    });

    it('Should not close browser if not existed', async () => {
      service['browser'] = null;
      await service.onModuleDestroy();

      expect(mockBrowser.close).not.toHaveBeenCalled();
    });

    it('Should throw error if browser close failed', async () => {
      await service.onModuleInit();

      mockBrowser.close.mockRejectedValueOnce(new Error('Something Wrong!'));

      await expect(service.onModuleDestroy()).rejects.toThrow(
        new Error('Something Wrong!'),
      );
    });
  });

  describe('launchNewPage', () => {
    it('Should launch new page successfully', async () => {
      await service.onModuleInit();
      const page = await service.launchNewPage();

      expect(page).toBe(mockPage);
      expect(mockBrowser.newPage).toHaveBeenCalledTimes(1);
    });

    it('Should throw InternalServerErrorException if browser not existed', async () => {
      await expect(service.launchNewPage()).rejects.toThrow(
        new InternalServerErrorException('Somethings wrong!'),
      );
    });

    it('Should throw error if browser new page failed', async () => {
      await service.onModuleInit();

      mockBrowser.newPage.mockRejectedValueOnce(new Error('Something Wrong!'));

      await expect(service.launchNewPage()).rejects.toThrow(
        new Error('Something Wrong!'),
      );
    });
  });

  describe('configPage', () => {
    it('Should config page successfully', async () => {
      await service.configPage(mockPage);

      expect(mockPage.setUserAgent).toHaveBeenCalledTimes(1);
      expect(mockPage.setUserAgent).toHaveBeenCalledWith(expect.any(String));
      expect(mockPage.setViewport).toHaveBeenCalledTimes(1);
      expect(mockPage.setViewport).toHaveBeenCalledWith(
        GoogleCrawlerOption.viewPort,
      );
      expect(mockPage.setCookie).toHaveBeenCalledTimes(1);
      expect(mockPage.setCookie).toHaveBeenCalledWith(
        ...GoogleCrawlerOption.cookies,
      );
    });

    it('Should throw error if page setUserAgent failed', async () => {
      mockPage.setUserAgent.mockRejectedValueOnce(
        new Error('Something Wrong!'),
      );

      await expect(service.configPage(mockPage)).rejects.toThrow(
        new Error('Something Wrong!'),
      );
    });
  });

  describe('navigateToLink', () => {
    it('Should navigate link successfully', async () => {
      await service.navigateToLink(GoogleCrawlerOption.link, mockPage);

      expect(mockPage.goto).toHaveBeenCalledTimes(1);
      expect(mockPage.goto).toHaveBeenCalledWith(GoogleCrawlerOption.link, {
        waitUntil: 'networkidle0',
      });
    });

    it('Should throw error if page goto failed', async () => {
      mockPage.goto.mockRejectedValueOnce(new Error('Something Wrong!'));

      await expect(
        service.navigateToLink(GoogleCrawlerOption.link, mockPage),
      ).rejects.toThrow(new Error('Something Wrong!'));
    });
  });

  describe('getPageContent', () => {
    it('Should get page content successfully', async () => {
      await expect(service.getPageContent(mockPage)).resolves.toEqual(
        mockContent,
      );
      expect(mockPage.content).toHaveBeenCalledTimes(1);
    });

    it('Should throw error if page get content failed', async () => {
      mockPage.content.mockRejectedValueOnce(new Error('Something Wrong!'));

      await expect(service.getPageContent(mockPage)).rejects.toThrow(
        new Error('Something Wrong!'),
      );
    });
  });

  describe('waitForSelector', () => {
    it('Should wait for selector with default timeout', async () => {
      await service.waitForSelector(GoogleCrawlerOption.selector, mockPage);

      expect(mockPage.waitForSelector).toHaveBeenCalledTimes(1);
      expect(mockPage.waitForSelector).toHaveBeenCalledWith(
        GoogleCrawlerOption.selector,
        {
          timeout: 50000,
        },
      );
    });

    it('Should wait for selector with custom timeout', async () => {
      const timeout = 1000;

      await service.waitForSelector(
        GoogleCrawlerOption.selector,
        mockPage,
        timeout,
      );

      expect(mockPage.waitForSelector).toHaveBeenCalledTimes(1);
      expect(mockPage.waitForSelector).toHaveBeenCalledWith(
        GoogleCrawlerOption.selector,
        {
          timeout,
        },
      );
    });

    it('Should throw error if page wait for selector failed', async () => {
      mockPage.waitForSelector.mockRejectedValueOnce(
        new Error('Something Wrong!'),
      );

      await expect(
        service.waitForSelector(GoogleCrawlerOption.selector, mockPage),
      ).rejects.toThrow(new Error('Something Wrong!'));
    });
  });

  describe('close', () => {
    it('Should close page successfully', async () => {
      await service.closePage(mockPage);

      expect(mockPage.close).toHaveBeenCalledTimes(1);
    });

    it('Should throw error if page close failed', async () => {
      mockPage.close.mockRejectedValueOnce(new Error('Something Wrong!'));

      await expect(service.closePage(mockPage)).rejects.toThrow(
        new Error('Something Wrong!'),
      );
    });
  });

  describe('getRandomUserAgent', () => {
    it('Should generate random user agent successfully', () => {
      expect(GoogleCrawlerOption.userAgents).toContain(
        service['getRandomUserAgent'](),
      );
    });
  });
});
