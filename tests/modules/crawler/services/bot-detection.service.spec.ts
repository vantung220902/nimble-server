import { AppConfig } from '@config';
import { PuppeteerProvider } from '@modules/crawler/providers';
import {
  BotDetectionService,
  CaptchaDetectionService,
} from '@modules/crawler/services';
import { Test, TestingModule } from '@nestjs/testing';

describe('BotDetectionService', () => {
  let moduleRef: TestingModule;
  let service: BotDetectionService;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: AppConfig,
          useValue: {},
        },
        PuppeteerProvider,
        {
          provide: BotDetectionService,
          useClass: CaptchaDetectionService,
        },
      ],
    })
      .overrideProvider(AppConfig)
      .useValue({})
      .compile();

    service = moduleRef.get(BotDetectionService);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });
});
