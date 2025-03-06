import { AppConfig } from '@config';
import { GoogleCrawlerOption } from '@modules/crawler/crawler.enum';
import {
  CaptchaDetectionService,
  ContentParserService,
  CrawlerService,
  PageManagementService,
} from '@modules/crawler/services';
import { Test, TestingModule } from '@nestjs/testing';
import { Page } from 'puppeteer';

describe('CrawlerService', () => {
  let service: CrawlerService;
  let contentParserService: ContentParserService;
  let mockPageManagementService: jest.Mocked<PageManagementService>;
  let mockCaptchaDetectionService: jest.Mocked<CaptchaDetectionService>;
  let mockAppConfig: Partial<AppConfig>;
  let mockPage: jest.Mocked<Page>;
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

  beforeEach(async () => {
    mockPage = {
      close: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Page>;

    mockPageManagementService = {
      launchNewPage: jest.fn().mockResolvedValue(mockPage),
      configPage: jest.fn().mockResolvedValue(undefined),
      navigateToLink: jest.fn().mockResolvedValue(undefined),
      waitForSelector: jest.fn().mockResolvedValue(undefined),
      getPageContent: jest.fn().mockResolvedValue(mockContent),
      closePage: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<PageManagementService>;

    mockCaptchaDetectionService = {
      detect: jest.fn().mockResolvedValue(false),
      resolve: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<CaptchaDetectionService>;

    mockAppConfig = {
      isProduction: false,
    };

    const testModule: TestingModule = await Test.createTestingModule({
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

    service = testModule.get<CrawlerService>(CrawlerService);
    contentParserService =
      testModule.get<ContentParserService>(ContentParserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crawlKeyword', () => {
    const keyword = 'Nimble';

    it('should crawl keyword successfully', async () => {
      const crawledContent = await service.crawlKeyword(keyword);
      const document = contentParserService.getDocumentContent(mockContent);
      const expectedAds = contentParserService.countAdsFromDocument(document);
      const expectedLinks =
        contentParserService.countLinksFromDocument(document);

      expect(crawledContent).toEqual({
        totalAds: expectedAds,
        totalLinks: expectedLinks,
        content: mockContent,
        keyword,
      });

      expect(mockPageManagementService.launchNewPage).toHaveBeenCalled();
      expect(mockPageManagementService.configPage).toHaveBeenCalledWith(
        mockPage,
      );
      expect(mockPageManagementService.navigateToLink).toHaveBeenCalledWith(
        `${GoogleCrawlerOption.link}/search?q=${encodeURIComponent(keyword)}`,
        mockPage,
      );
    });

    it('should handle errors and close page', async () => {
      const error = new Error('Navigation failed');
      mockPageManagementService.navigateToLink.mockRejectedValueOnce(error);

      const crawledContent = await service.crawlKeyword(keyword);

      expect(crawledContent).toBeUndefined();
      expect(mockPageManagementService.closePage).toHaveBeenCalledWith(
        mockPage,
      );
    });

    it('should parse content correctly', async () => {
      const crawledContent = await service.crawlKeyword(keyword);
      const document = contentParserService.getDocumentContent(mockContent);

      expect(crawledContent?.totalAds).toBe(
        contentParserService.countAdsFromDocument(document),
      );
      expect(crawledContent?.totalLinks).toBe(
        contentParserService.countLinksFromDocument(document),
      );
    });
  });
});
