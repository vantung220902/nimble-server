import { Logger } from '@nestjs/common';
import { Page } from 'puppeteer';

export abstract class BotDetectionService {
  protected abstract readonly logger: Logger;

  public abstract detect(page: Page): Promise<boolean>;

  public abstract resolve(page: Page): Promise<void>;
}
