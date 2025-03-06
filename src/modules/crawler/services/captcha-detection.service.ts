import { AppConfig } from '@config';
import {
  PUPPETEER_KEY_PROVIDER,
  PuppeteerProvider,
} from '@modules/crawler/providers';
import { BotDetectionService } from '@modules/crawler/services';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Page } from 'puppeteer';
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

@Injectable()
export class CaptchaDetectionService
  extends BotDetectionService
  implements OnModuleInit
{
  protected readonly logger: Logger = new Logger();

  constructor(
    private readonly appConfig: AppConfig,
    @Inject(PUPPETEER_KEY_PROVIDER)
    private readonly puppeteerProvider: PuppeteerProvider,
  ) {
    super();
  }

  public async detect(page: Page): Promise<boolean> {
    const isCaptchaPresent = await page.evaluate(
      () =>
        document.querySelector('form[action*="captcha"]') !== null ||
        document.querySelector('.g-recaptcha') !== null,
    );

    this.logger.warn(
      `CAPTCHA ${isCaptchaPresent ? 'detected!' : 'not detected'}`,
    );

    return isCaptchaPresent;
  }

  public onModuleInit() {
    this.puppeteerProvider.use(StealthPlugin());
    this.puppeteerProvider.use(
      RecaptchaPlugin({
        provider: {
          id: '2captcha',
          token: this.appConfig.reCaptchaApi,
        },
        visualFeedback: true,
      }),
    );
  }

  public async resolve(page: Page): Promise<void> {
    try {
      const { solutions, solved } = await page.solveRecaptchas();
      this.logger.debug(`Solution ${JSON.stringify(solutions, null, 5)}`);
      this.logger.debug(`Solved ${JSON.stringify(solved, null, 5)}`);
    } catch (error) {
      this.logger.error(
        `CaptchaDetectionService resolve error: ${JSON.stringify(error, null, 5)}`,
      );
    }
  }
}
