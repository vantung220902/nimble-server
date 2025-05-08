import { Test, TestingModule } from '@nestjs/testing';
import { RedisModule } from '@redis';
import { RedisService } from '@redis/services';

describe('RedisModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [RedisModule],
    }).compile();
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('Should be defined', () => {
    expect(moduleRef).toBeDefined();
  });

  it('Should provide RedisService service', () => {
    const redisService = moduleRef.get<RedisService>(RedisService);

    expect(redisService).toBeDefined();
  });
});
