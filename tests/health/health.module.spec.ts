import { HealthModule } from '@health';
import { HealthController } from '@health/health.controller';
import { Test, TestingModule } from '@nestjs/testing';

describe('HealthModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [HealthModule],
    }).compile();
  });

  it('Should be defined', () => {
    expect(moduleRef).toBeDefined();
  });

  it('Should provide HealthController', () => {
    const healthController = moduleRef.get<HealthController>(HealthController);

    expect(healthController).toBeDefined();
  });
});
