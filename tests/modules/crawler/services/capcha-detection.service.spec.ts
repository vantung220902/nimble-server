import { AppConfig } from '@config';
import { CaptchaDetectionService } from '@modules/crawler/services';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Page } from 'puppeteer';
import { PUPPETEER_KEY_PROVIDER } from './../../../../src/modules/crawler/providers/puppeteer.provider';

jest.mock('puppeteer-extra-plugin-stealth', () =>
  jest
    .fn()
    .mockImplementation(() => ({ name: 'puppeteer-extra-plugin-stealth' })),
);
jest.mock('puppeteer-extra-plugin-recaptcha', () =>
  jest.fn().mockImplementation((config: any) => ({
    name: 'puppeteer-extra-plugin-recaptcha',
    ...config,
  })),
);

describe('CaptchaDetectionService', () => {
  let service: CaptchaDetectionService;
  let moduleRef: TestingModule;

  const mockPuppeteerProvider = { use: jest.fn() };
  const mockPage = {
    evaluate: jest.fn(),
    solveRecaptchas: jest.fn(),
  } as unknown as jest.Mocked<Page>;
  const mockAppConfig = {
    reCaptchaApi: 'api-key',
  };

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
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

    service = moduleRef.get(CaptchaDetectionService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await moduleRef.close();
  });

  it('Should CaptchaDetectionService be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('Should initialize puppeteer plugins correctly', () => {
      service.onModuleInit();

      expect(mockPuppeteerProvider.use).toHaveBeenCalledTimes(2);
      expect(mockPuppeteerProvider.use).toHaveBeenNthCalledWith(1, {
        name: 'puppeteer-extra-plugin-stealth',
      });
      expect(mockPuppeteerProvider.use).toHaveBeenNthCalledWith(2, {
        name: 'puppeteer-extra-plugin-recaptcha',
        provider: {
          id: '2captcha',
          token: mockAppConfig.reCaptchaApi,
        },
        visualFeedback: true,
      });
    });
  });

  describe('detect', () => {
    let loggerSpy: jest.SpyInstance;

    beforeEach(() => {
      loggerSpy = jest.spyOn(Logger.prototype, 'warn');
    });

    it('Should detect no captcha', async () => {
      mockPage.evaluate.mockResolvedValueOnce(false);

      await expect(service.detect(mockPage)).resolves.toEqual(false);
      expect(loggerSpy).toHaveBeenCalledWith('CAPTCHA not detected');
      expect(mockPage.evaluate).toHaveBeenCalledTimes(1);
      expect(mockPage.evaluate).toHaveBeenCalledWith(expect.any(Function));
    });

    it('Should detect captcha presence', async () => {
      mockPage.evaluate.mockResolvedValueOnce(true);

      await expect(service.detect(mockPage)).resolves.toEqual(true);
      expect(loggerSpy).toHaveBeenCalledWith('CAPTCHA detected!');
      expect(mockPage.evaluate).toHaveBeenCalledTimes(1);
      expect(mockPage.evaluate).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('resolve', () => {
    let loggerErrorSpy: jest.SpyInstance;
    let loggerDebugSpy: jest.SpyInstance;

    beforeEach(() => {
      loggerErrorSpy = jest.spyOn(Logger.prototype, 'error');
      loggerDebugSpy = jest.spyOn(Logger.prototype, 'debug');
    });

    it('Should resolve captcha successfully', async () => {
      mockPage.solveRecaptchas.mockResolvedValueOnce({
        solved: true,
        solutions: ['Resolve reCAPTCHA V2'],
        captchas: [],
        filtered: [],
        error: null,
      } as any);

      await service.resolve(mockPage);

      expect(mockPage.solveRecaptchas).toHaveBeenCalledTimes(1);
      expect(loggerDebugSpy).toHaveBeenCalledTimes(2);
      expect(loggerDebugSpy).toHaveBeenNthCalledWith(
        1,
        `Solution ${JSON.stringify(['Resolve reCAPTCHA V2'], null, 5)}`,
      );
      expect(loggerDebugSpy).toHaveBeenNthCalledWith(2, `Solved true`);
    });

    it('Should handle if resolution errors', async () => {
      mockPage.solveRecaptchas.mockRejectedValueOnce(
        new Error('Something Wrong!'),
      );

      await service.resolve(mockPage);

      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        `CaptchaDetectionService resolve error: ${JSON.stringify(new Error('Something Wrong!'), null, 5)}`,
      );
    });
  });
});
