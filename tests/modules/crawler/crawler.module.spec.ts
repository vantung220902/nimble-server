import { AppConfig } from '@config';
import { CrawlerModule } from '@modules/crawler';
import * as services from '@modules/crawler/services';
import { Test, TestingModule } from '@nestjs/testing';

describe('CrawlerModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [CrawlerModule],
    })
      .useMocker((token) => {
        if (Object.is(token, AppConfig)) {
          return {};
        }
      })
      .compile();
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('Should be defined', () => {
    expect(moduleRef).toBeDefined();
  });

  it.each(Object.values(services))('Should provide %s service', (service) => {
    const provider = moduleRef.get(service);

    expect(provider).toBeDefined();
  });
});
