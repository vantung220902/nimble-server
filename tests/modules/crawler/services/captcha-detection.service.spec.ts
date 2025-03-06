import { AppConfig } from '@config';
import { PUPPETEER_KEY_PROVIDER } from '@modules/crawler/providers';
import { CaptchaDetectionService } from '@modules/crawler/services';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Page } from 'puppeteer';

jest.mock('puppeteer-extra-plugin-stealth', () => {
  return jest.fn().mockImplementation(() => ({
    name: 'puppeteer-extra-plugin-stealth',
  }));
});

jest.mock('puppeteer-extra-plugin-recaptcha', () => {
  return jest.fn().mockImplementation(() => ({
    name: 'puppeteer-extra-plugin-recaptcha',
    opts: {
      provider: {
        id: '2captcha',
        token: 'api-key',
      },
      visualFeedback: true,
    },
  }));
});

describe('CaptchaDetectionService', () => {
  let service: CaptchaDetectionService;
  let mockPuppeteerProvider: { use: jest.Mock };
  let mockPage: jest.Mocked<Page>;
  let mockAppConfig: Partial<AppConfig>;
  let loggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    mockPage = {
      evaluate: jest.fn().mockResolvedValue(false),
      solveRecaptchas: jest.fn().mockResolvedValue({
        solved: true,
        solutions: ['Resolve reCAPTCHA V2'],
        captchas: [],
        filtered: [],
        error: null,
      }),
    } as unknown as jest.Mocked<Page>;

    mockPuppeteerProvider = {
      use: jest.fn(),
    };

    mockAppConfig = {
      reCaptchaApi: 'api-key',
    };

    const testModule: TestingModule = await Test.createTestingModule({
      providers: [
        CaptchaDetectionService,
        {
          provide: PUPPETEER_KEY_PROVIDER,
          useValue: mockPuppeteerProvider,
        },
        {
          provide: AppConfig,
          useValue: mockAppConfig,
        },
      ],
    }).compile();

    service = testModule.get<CaptchaDetectionService>(CaptchaDetectionService);
    loggerSpy = jest.spyOn(Logger.prototype, 'warn');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should initialize puppeteer plugins', () => {
      service.onModuleInit();

      expect(mockPuppeteerProvider.use).toHaveBeenCalledTimes(2);
      expect(mockPuppeteerProvider.use).toHaveBeenNthCalledWith(1, {
        name: 'puppeteer-extra-plugin-stealth',
      });
      expect(mockPuppeteerProvider.use).toHaveBeenNthCalledWith(2, {
        name: 'puppeteer-extra-plugin-recaptcha',
        opts: {
          provider: {
            id: '2captcha',
            token: mockAppConfig.reCaptchaApi,
          },
          visualFeedback: true,
        },
      });
    });
  });

  describe('detect', () => {
    it('should detect no captcha', async () => {
      mockPage.evaluate.mockResolvedValueOnce(false);

      const isCaptchaDetected = await service.detect(mockPage);

      expect(isCaptchaDetected).toBe(false);
      expect(loggerSpy).toHaveBeenCalledWith('CAPTCHA not detected');
    });

    it('should detect captcha presence', async () => {
      mockPage.evaluate.mockResolvedValueOnce(true);

      const isCaptchaDetected = await service.detect(mockPage);

      expect(isCaptchaDetected).toBe(true);
      expect(loggerSpy).toHaveBeenCalledWith('CAPTCHA detected!');
    });

    it('should evaluate correct selectors', async () => {
      await service.detect(mockPage);

      expect(mockPage.evaluate).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('resolve', () => {
    let loggerDebugSpy: jest.SpyInstance;
    let loggerErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      loggerDebugSpy = jest.spyOn(Logger.prototype, 'debug');
      loggerErrorSpy = jest.spyOn(Logger.prototype, 'error');
    });

    it('should resolve captcha successfully', async () => {
      const mockSolution = {
        solved: true,
        solutions: ['resolve reCAPTCHA V2'],
        captchas: [],
        filtered: [],
        error: null,
      } as any;
      mockPage.solveRecaptchas.mockResolvedValueOnce(mockSolution);

      await service.resolve(mockPage);

      expect(mockPage.solveRecaptchas).toHaveBeenCalled();
      expect(loggerDebugSpy).toHaveBeenCalledWith(
        `Solution ${JSON.stringify(mockSolution.solutions, null, 5)}`,
      );
      expect(loggerDebugSpy).toHaveBeenCalledWith(
        `Solved ${JSON.stringify(mockSolution.solved, null, 5)}`,
      );
    });

    it('should handle resolution errors', async () => {
      const error = new Error('Somethings wrong!');
      mockPage.solveRecaptchas.mockRejectedValueOnce(error);

      await service.resolve(mockPage);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        `CaptchaDetectionService resolve error: ${JSON.stringify(error, null, 5)}`,
      );
    });
  });
});
