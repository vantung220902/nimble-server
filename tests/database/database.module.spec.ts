import { DatabaseModule } from '@database';
import * as services from '@database/services';
import { Test, TestingModule } from '@nestjs/testing';

describe('DatabaseModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [DatabaseModule],
    }).compile();
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  test('Should be defined', () => {
    expect(moduleRef).toBeDefined();
  });

  test.each(Object.values(services))(
    'Should provide %s service',
    (serviceClass) => {
      const service = moduleRef.get(serviceClass);

      expect(service).toBeDefined();
    },
  );
});
