import { Provider } from '@nestjs/common';
import puppeteer from 'puppeteer-extra';

export const PUPPETEER_KEY_PROVIDER = 'PUPPETEER';

export const PuppeteerProvider: Provider = {
  provide: PUPPETEER_KEY_PROVIDER,
  useValue: puppeteer,
};

export type PuppeteerProvider = typeof puppeteer;
