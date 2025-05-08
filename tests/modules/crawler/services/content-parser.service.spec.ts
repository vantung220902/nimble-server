import { GoogleCrawlerOption } from '@modules/crawler/crawler.enum';
import { ContentParserService } from '@modules/crawler/services';
import { Test, TestingModule } from '@nestjs/testing';
import { Page } from 'puppeteer';

describe('ContentParserService', () => {
  let service: ContentParserService;
  let moduleRef: TestingModule;

  const mockPage = {
    evaluate: jest.fn(),
    $$eval: jest.fn(),
  } as unknown as jest.Mocked<Page>;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [ContentParserService],
    }).compile();

    service = moduleRef.get(ContentParserService);
  });

  afterEach(async () => {
    await moduleRef.close();
    jest.clearAllMocks();
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDocumentContent', () => {
    it('Should parse HTML content successfully', () => {
      const htmlContent =
        '<html><body><div><h1>Nimble</h1></div></body></html>';
      const documentContent = service.getDocumentContent(htmlContent);

      expect(documentContent).toBeDefined();
      expect(documentContent.querySelector('h1').textContent).toEqual('Nimble');
    });

    it('Should handle empty content', () => {
      const documentContent = service.getDocumentContent('');

      expect(documentContent).toBeDefined();
      expect(documentContent.body.innerHTML).toEqual('');
    });

    it('Should handle invalid HTML content', () => {
      const documentContent = service.getDocumentContent('<div>Unclose <div');

      expect(documentContent).toBeDefined();
      expect(documentContent.querySelector('div')?.innerText).toBeUndefined();
    });
  });

  describe('countAdsFromDocument', () => {
    it('Should count ads correctly', () => {
      const htmlContent = `
        <html>
          <body>
            <div class="mnr-c pla-unit">Nimble Ad 1</div>
            <div class="mnr-c pla-unit">Nimble Ad 2</div>
            <div class="twpSFc mnr-c">Nimble Ad 3</div>
            <div>Normal content</div>
          </body>
        </html>
      `;
      const documentContent = service.getDocumentContent(htmlContent);
      const adCount = service.countAdsFromDocument(documentContent);

      expect(adCount).toEqual(3);
    });

    it('Should handle no ads', () => {
      const htmlContent = `
        <html>
          <body>
            <div>Normal content</div>
          </body>
        </html>
      `;
      const documentContent = service.getDocumentContent(htmlContent);
      const adCount = service.countAdsFromDocument(documentContent);

      expect(adCount).toEqual(0);
    });

    it('Should count correct with ad selectors', () => {
      const htmlContent = `
              <html>
          <body>
            ${GoogleCrawlerOption.adSelectors
              .map(
                (selector) =>
                  `<div class="${selector.split('.').slice(-2).join(' ')}">Ad</div>`,
              )
              .join('')}
          </body>
        </html>
      `;
      const documentContent = service.getDocumentContent(htmlContent);
      const adCount = service.countAdsFromDocument(documentContent);

      expect(adCount).toEqual(GoogleCrawlerOption.adSelectors.length);
    });
  });

  describe('countLinksFromDocument', () => {
    it('Should count link correctly', () => {
      const htmlContent = `
        <html>
          <body>
            <a href="#">Nimble Link 1</a>
            <a href="#">Nimble Link 2</a>
            <div>Normal content</div>
          </body>
        </html>
      `;
      const documentContent = service.getDocumentContent(htmlContent);
      const linkCount = service.countLinksFromDocument(documentContent);

      expect(linkCount).toEqual(2);
    });

    it('Should handle no link', () => {
      const htmlContent = `
        <html>
          <body>
            <div>Normal content</div>
          </body>
        </html>
      `;
      const documentContent = service.getDocumentContent(htmlContent);
      const linkCount = service.countLinksFromDocument(documentContent);

      expect(linkCount).toEqual(0);
    });

    it('Should count only valid link tags', () => {
      const htmlContent = `
        <html>
          <body>
            <a href="#">Nimble link</a>
            <a>Nimble without link</a>
            <div class="link">Normal content</div>
          </body>
        </html>
      `;
      const documentContent = service.getDocumentContent(htmlContent);
      const linkCount = service.countLinksFromDocument(documentContent);

      expect(linkCount).toEqual(1);
    });
  });

  describe('countAdsFromPage', () => {
    it('Should count ad correctly', async () => {
      mockPage.evaluate.mockResolvedValueOnce(5);

      const adCount = await service.countAdsFromPage(mockPage);

      expect(adCount).toEqual(5);
      expect(mockPage.evaluate).toHaveBeenCalledTimes(1);
      expect(mockPage.evaluate).toHaveBeenCalledWith(
        expect.any(Function),
        GoogleCrawlerOption.adSelectors,
      );
    });

    it('Should handle empty ad element', async () => {
      mockPage.evaluate.mockResolvedValueOnce(0);

      const adCount = await service.countAdsFromPage(mockPage);

      expect(adCount).toEqual(0);
      expect(mockPage.evaluate).toHaveBeenCalledTimes(1);
      expect(mockPage.evaluate).toHaveBeenCalledWith(
        expect.any(Function),
        GoogleCrawlerOption.adSelectors,
      );
    });

    it('Should throw error if page evaluate failed', async () => {
      mockPage.evaluate.mockRejectedValueOnce(new Error('Something Wrong!'));

      await expect(service.countAdsFromPage(mockPage)).rejects.toThrow(
        new Error('Something Wrong!'),
      );
    });
  });

  describe('countLinksFromPage', () => {
    it('Should count link correctly', async () => {
      mockPage.$$eval.mockResolvedValueOnce(5);

      const linkCount = await service.countLinksFromPage(mockPage);

      expect(linkCount).toEqual(5);
      expect(mockPage.$$eval).toHaveBeenCalledTimes(1);
      expect(mockPage.$$eval).toHaveBeenCalledWith(
        'a[href]',
        expect.any(Function),
      );
    });

    it('Should handle empty link element', async () => {
      mockPage.$$eval.mockResolvedValueOnce(0);

      const linkCount = await service.countLinksFromPage(mockPage);

      expect(linkCount).toEqual(0);
      expect(mockPage.$$eval).toHaveBeenCalledTimes(1);
      expect(mockPage.$$eval).toHaveBeenCalledWith(
        'a[href]',
        expect.any(Function),
      );
    });

    it('Should throw error if page evaluate failed', async () => {
      mockPage.$$eval.mockRejectedValueOnce(new Error('Something Wrong!'));

      await expect(service.countLinksFromPage(mockPage)).rejects.toThrow(
        new Error('Something Wrong!'),
      );
    });
  });
});
