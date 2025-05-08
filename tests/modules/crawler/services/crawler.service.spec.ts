import { AppConfig } from '@config';
import { GoogleCrawlerOption } from '@modules/crawler/crawler.enum';
import {
  CaptchaDetectionService,
  ContentParserService,
  CrawlerService,
  PageManagementService,
} from '@modules/crawler/services';
import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Page } from 'puppeteer';

describe('CrawlerService', () => {
  let service: CrawlerService;
  let contentParserService: ContentParserService;
  let moduleRef: TestingModule;

  const mockLinks = ['http://localhost:4000', 'http://localhost:4001'];
  const mockContent = `
        <html>
          <body>
            ${GoogleCrawlerOption.adSelectors
              .map(
                (selector) =>
                  `<div class="${selector.split('.').slice(-2).join(' ')}">Ad</div>`,
              )
              .join('')}
              
            ${mockLinks.map(
              (link, index) => `<a href="${link}">Nimble Link ${index + 1}</a>`,
            )}
            <div>Normal content</div>
          </body>
        </html>
      `;
  const mockPage = {
    close: jest.fn(),
  } as unknown as jest.Mocked<Page>;
  const mockPageManagementService = {
    launchNewPage: jest.fn().mockResolvedValue(mockPage),
    configPage: jest.fn(),
    navigateToLink: jest.fn(),
    waitForSelector: jest.fn(),
    getPageContent: jest.fn().mockResolvedValue(mockContent),
    closePage: jest.fn(),
  };
  const mockAppConfig = {
    isProduction: false,
  };
  const mockCaptchaDetectionService = {
    detect: jest.fn().mockResolvedValue(false),
    resolve: jest.fn(),
  };

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: PageManagementService,
          useValue: mockPageManagementService,
        },
        {
          provide: CaptchaDetectionService,
          useValue: mockCaptchaDetectionService,
        },
        ContentParserService,
        {
          provide: AppConfig,
          useValue: mockAppConfig,
        },
        CrawlerService,
      ],
    }).compile();

    service = moduleRef.get(CrawlerService);
    contentParserService = moduleRef.get(ContentParserService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await moduleRef.close();
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
    expect(contentParserService).toBeDefined();
  });

  describe('crawlKeyword', () => {
    const keyword = 'Nimble';

    let documentContent: Document;
    let expectedAdCount: number;
    let expectedLinkCount: number;

    beforeEach(() => {
      documentContent = contentParserService.getDocumentContent(mockContent);
      expectedAdCount =
        contentParserService.countAdsFromDocument(documentContent);
      expectedLinkCount =
        contentParserService.countLinksFromDocument(documentContent);
    });

    it('Should crawl keyword search content successfully', async () => {
      const crawledContent = await service.crawlKeyword(keyword);

      expect(crawledContent).toEqual({
        totalAds: expectedAdCount,
        totalLinks: expectedLinkCount,
        content: mockContent,
        keyword,
      });
      expect(mockPageManagementService.launchNewPage).toHaveBeenCalledTimes(1);
      expect(mockPageManagementService.configPage).toHaveBeenCalledTimes(1);
      expect(mockPageManagementService.configPage).toHaveBeenCalledWith(
        mockPage,
      );
      expect(mockPageManagementService.navigateToLink).toHaveBeenCalledTimes(1);
      expect(mockPageManagementService.navigateToLink).toHaveBeenCalledWith(
        `${GoogleCrawlerOption.link}/search?q=${encodeURIComponent(keyword)}`,
        mockPage,
      );
      expect(mockCaptchaDetectionService.detect).toHaveBeenCalledTimes(1);
      expect(mockCaptchaDetectionService.detect).toHaveBeenCalledWith(mockPage);
      expect(mockPageManagementService.waitForSelector).toHaveBeenCalledTimes(
        1,
      );
      expect(mockPageManagementService.waitForSelector).toHaveBeenCalledWith(
        GoogleCrawlerOption.selector,
        mockPage,
      );
      expect(mockPageManagementService.getPageContent).toHaveBeenCalledTimes(1);
      expect(mockPageManagementService.getPageContent).toHaveBeenCalledWith(
        mockPage,
      );
      expect(mockPageManagementService.closePage).toHaveBeenCalledTimes(1);
      expect(mockPageManagementService.closePage).toHaveBeenCalledWith(
        mockPage,
      );
    });

    it('Should handle crawling keyword if captcha detected on production', async () => {
      mockAppConfig.isProduction = true;
      mockCaptchaDetectionService.detect.mockResolvedValueOnce(true);

      const crawledContent = await service.crawlKeyword(keyword);

      expect(crawledContent).toEqual({
        totalAds: expectedAdCount,
        totalLinks: expectedLinkCount,
        content: mockContent,
        keyword,
      });
      expect(mockPageManagementService.launchNewPage).toHaveBeenCalledTimes(1);
      expect(mockPageManagementService.configPage).toHaveBeenCalledTimes(1);
      expect(mockPageManagementService.configPage).toHaveBeenCalledWith(
        mockPage,
      );
      expect(mockPageManagementService.navigateToLink).toHaveBeenCalledTimes(1);
      expect(mockPageManagementService.navigateToLink).toHaveBeenCalledWith(
        `${GoogleCrawlerOption.link}/search?q=${encodeURIComponent(keyword)}`,
        mockPage,
      );
      expect(mockCaptchaDetectionService.detect).toHaveBeenCalledTimes(1);
      expect(mockCaptchaDetectionService.detect).toHaveBeenCalledWith(mockPage);
      expect(mockCaptchaDetectionService.resolve).toHaveBeenCalledTimes(1);
      expect(mockCaptchaDetectionService.resolve).toHaveBeenCalledWith(
        mockPage,
      );
      expect(mockPageManagementService.waitForSelector).toHaveBeenCalledTimes(
        1,
      );
      expect(mockPageManagementService.waitForSelector).toHaveBeenCalledWith(
        GoogleCrawlerOption.selector,
        mockPage,
      );
      expect(mockPageManagementService.getPageContent).toHaveBeenCalledTimes(1);
      expect(mockPageManagementService.getPageContent).toHaveBeenCalledWith(
        mockPage,
      );
      expect(mockPageManagementService.closePage).toHaveBeenCalledTimes(1);
      expect(mockPageManagementService.closePage).toHaveBeenCalledWith(
        mockPage,
      );
    });

    it('Should throw InternalServerErrorException if launchNewPage failed', async () => {
      mockPageManagementService.launchNewPage.mockRejectedValueOnce(
        new InternalServerErrorException('Somethings wrong!'),
      );

      await expect(service.crawlKeyword(keyword)).rejects.toThrow(
        new InternalServerErrorException('Somethings wrong!'),
      );
      expect(mockPageManagementService.configPage).not.toHaveBeenCalled();
      expect(mockPageManagementService.navigateToLink).not.toHaveBeenCalled();
      expect(mockCaptchaDetectionService.detect).not.toHaveBeenCalled();
      expect(mockPageManagementService.waitForSelector).not.toHaveBeenCalled();
      expect(mockPageManagementService.getPageContent).not.toHaveBeenCalled();
      expect(mockPageManagementService.closePage).not.toHaveBeenCalled();
    });

    it('Should handle error and close page', async () => {
      mockPageManagementService.configPage.mockRejectedValueOnce(
        new Error('Something Wrong!'),
      );

      await expect(service.crawlKeyword(keyword)).resolves.toBeUndefined();
      expect(mockPageManagementService.navigateToLink).not.toHaveBeenCalled();
      expect(mockCaptchaDetectionService.detect).not.toHaveBeenCalled();
      expect(mockPageManagementService.waitForSelector).not.toHaveBeenCalled();
      expect(mockPageManagementService.getPageContent).not.toHaveBeenCalled();
    });
  });
});
