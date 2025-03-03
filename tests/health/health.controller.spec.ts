import { HealthController } from '@health/health.controller';
import { HealthCheckService } from '@nestjs/terminus';
import { anything, instance, mock, verify, when } from 'ts-mockito';

describe('HealthController', () => {
  test('should call health-check service', async () => {
    const mockHealthCheckService = mock(HealthCheckService);
    when(mockHealthCheckService.check(anything())).thenResolve({
      status: 'ok',
      details: {},
    });

    const response = await new HealthController(
      instance(mockHealthCheckService),
    ).check();

    expect(response).toEqual({
      status: 'ok',
      details: {},
    });

    verify(mockHealthCheckService.check(anything())).once();
  });
});
