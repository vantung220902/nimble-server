import { AppConfig } from '@config';
import { EmailModule } from '@email';
import * as services from '@email/services';
import { Test, TestingModule } from '@nestjs/testing';

describe('EmailModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [EmailModule],
    })
      .overrideProvider(AppConfig)
      .useValue({
        emailForm: 'test@gmail.com',
      })
      .compile();
  });

  test('Should be defined', () => {
    expect(moduleRef).toBeDefined();
  });

  test.each(Object.values(services))('Should provide %s service', (service) => {
    const provider = moduleRef.get(service);
    expect(provider).toBeDefined();
  });
});
