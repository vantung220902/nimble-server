import { GoogleCrawlerOption } from '@modules/crawler/crawler.enum';
import { ContentParserService } from '@modules/crawler/services';
import { Test, TestingModule } from '@nestjs/testing';

describe('ContentParserService', () => {
  let service: ContentParserService;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      providers: [ContentParserService],
    }).compile();

    service = testModule.get<ContentParserService>(ContentParserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDocumentContent', () => {
    it('should parse HTML content successfully', () => {
      const htmlContent = '<html><body><div>Nimble</div></body></html>';

      const documentContent = service.getDocumentContent(htmlContent);

      expect(documentContent).toBeDefined();
      expect(documentContent.querySelector('div')?.textContent).toBe('Nimble');
    });

    it('should handle empty content', () => {
      const emptyDocumentContent = service.getDocumentContent('');

      expect(emptyDocumentContent).toBeDefined();
      expect(emptyDocumentContent.body.innerHTML).toBe('');
    });

    it('should handle invalid HTML', () => {
      const invalidHtml = '<div>Unclosed div';

      const invalidDocumentContent = service.getDocumentContent(invalidHtml);

      expect(invalidDocumentContent).toBeDefined();
      expect(invalidDocumentContent.querySelector('div')).toBeTruthy();
    });
  });

  describe('countAdsFromDocument', () => {
    it('should count ads correctly', () => {
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
      const document = service.getDocumentContent(htmlContent);

      const adCount = service.countAdsFromDocument(document);

      expect(adCount).toBe(3);
    });

    it('should handle no ads', () => {
      const htmlContent = '<html><body><div>Normal content</div></body></html>';
      const document = service.getDocumentContent(htmlContent);

      const adCount = service.countAdsFromDocument(document);

      expect(adCount).toBe(0);
    });

    it('should use correct ad selectors', () => {
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
      const document = service.getDocumentContent(htmlContent);

      const adCount = service.countAdsFromDocument(document);

      expect(adCount).toBe(GoogleCrawlerOption.adSelectors.length);
    });
  });

  describe('countLinksFromDocument', () => {
    it('should count links correctly', () => {
      const htmlContent = `
        <html>
          <body>
            <a href="#">Nimble Link 1</a>
            <a href="#">Nimble Link 2</a>
            <div>Normal content</div>
          </body>
        </html>
      `;
      const document = service.getDocumentContent(htmlContent);

      const linkCount = service.countLinksFromDocument(document);

      expect(linkCount).toBe(2);
    });

    it('should handle no links', () => {
      const htmlContent = '<html><body><div>Normal content</div></body></html>';
      const document = service.getDocumentContent(htmlContent);

      const linkCount = service.countLinksFromDocument(document);

      expect(linkCount).toBe(0);
    });

    it('should count only valid link tags', () => {
      const htmlContent = `
        <html>
          <body>
            <a href="#">Nimble link</a>
            <a>Nimble without link</a>
            <div class="link">Normal content</div>
          </body>
        </html>
      `;
      const document = service.getDocumentContent(htmlContent);

      const linkCount = service.countLinksFromDocument(document);

      expect(linkCount).toBe(1);
    });
  });
});
