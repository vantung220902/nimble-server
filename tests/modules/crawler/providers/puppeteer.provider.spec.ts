import {
  PUPPETEER_KEY_PROVIDER,
  PuppeteerProvider,
} from '@modules/crawler/providers';
import { Test, TestingModule } from '@nestjs/testing';
import puppeteer from 'puppeteer-extra';

describe('PuppeteerProvider', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [PuppeteerProvider],
    }).compile();
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('should be defined', () => {
    const provider = moduleRef.get(PUPPETEER_KEY_PROVIDER);
    expect(provider).toBeDefined();
  });

  it('should have correct provider configuration', () => {
    expect(PuppeteerProvider).toEqual({
      provide: PUPPETEER_KEY_PROVIDER,
      useValue: puppeteer,
    });
  });
});
