import { AppConfig } from '@config';
import { FileModule } from '@modules/file';
import * as useCases from '@modules/file/application';
import * as services from '@modules/file/services';
import { Test, TestingModule } from '@nestjs/testing';

const handlers = Object.values(useCases).filter((x) =>
  x.name.endsWith('Handler'),
);

describe('FileModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [FileModule],
    })
      .overrideProvider(AppConfig)
      .useValue({
        bucketS3Name: 'user-storage-dev',
      })
      .compile();
  });

  it('Should be defined', () => {
    expect(moduleRef).toBeDefined();
  });

  it.each(Object.values(services))('Should provide %s service', (service) => {
    const provide = moduleRef.get(service);

    expect(provide).toBeDefined();
  });

  it.each(handlers)('Should provide %s handler', (service) => {
    const handler = moduleRef.get(service);

    expect(handler).toBeDefined();
  });
});
