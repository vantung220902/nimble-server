import { HealthController } from '@health/health.controller';
import { HealthCheckService } from '@nestjs/terminus';
import { anything, instance, mock, verify, when } from 'ts-mockito';

describe('HealthController', () => {
  it('Should call health-check service correctly', async () => {
    const mockHealthCheckService = mock(HealthCheckService);
    when(mockHealthCheckService.check(anything())).thenResolve({
      status: 'ok',
      details: {},
    });

    const healthCheckController = new HealthController(
      instance(mockHealthCheckService),
    );
    const status = await healthCheckController.check();

    expect(status).toBeDefined();
    expect(status).toEqual({
      status: 'ok',
      details: {},
    });

    verify(mockHealthCheckService.check(anything())).once();
  });

  it('Should return failed health check server', async () => {
    const mockHealthCheckService = mock(HealthCheckService);
    when(mockHealthCheckService.check(anything())).thenResolve({
      status: 'error',
      details: {},
      error: {
        stack: {
          status: 'down',
          message: 'Something wrong!',
        },
      },
    });

    const healthCheckController = new HealthController(
      instance(mockHealthCheckService),
    );
    const status = await healthCheckController.check();

    expect(status).toBeDefined();
    expect(status).toEqual({
      status: 'error',
      details: {},
      error: {
        stack: {
          status: 'down',
          message: 'Something wrong!',
        },
      },
    });
    verify(mockHealthCheckService.check(anything())).once();
  });

  it('Should throw error when health check service failed', async () => {
    const mockHealthCheckService = mock(HealthCheckService);
    when(mockHealthCheckService.check(anything())).thenReject(
      new Error('Something wrong!'),
    );

    const healthCheckController = new HealthController(
      instance(mockHealthCheckService),
    );
    await expect(healthCheckController.check()).rejects.toThrow(
      'Something wrong!',
    );
  });
});
