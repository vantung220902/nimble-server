import { AuthenticationModule } from '@modules/authentication';
import * as useCases from '@modules/authentication/application';
import * as services from '@modules/authentication/services';
import { CacheModule } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';

const handlers = Object.values(useCases).filter((x) =>
  x.name.endsWith('Handler'),
);

describe('AuthenticationModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [CacheModule.register({ isGlobal: true }), AuthenticationModule],
    }).compile();
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

  it.each(Object.values(handlers))('Should provide %s handler', (handler) => {
    const provider = moduleRef.get(handler);

    expect(provider).toBeDefined();
  });
});
