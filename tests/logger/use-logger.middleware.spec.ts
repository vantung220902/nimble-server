import { useLogger } from '@logger';
import { loggerRequestMiddleware } from '@logger/logger-request.middleware';
import { INestApplication } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { anything, instance, mock, verify, when } from 'ts-mockito';

describe('useLogger', () => {
  it('Should call useLogger middleware', () => {
    const mockApp = mock<INestApplication>();
    const mockLogger = mock<Logger>() as any;

    when(mockApp.get(Logger)).thenResolve(instance(mockLogger));
    when(mockApp.use(loggerRequestMiddleware)).thenResolve();

    useLogger(instance(mockApp));

    verify(mockApp.get(Logger)).once();
    verify(mockApp.useLogger(anything())).once();
    verify(mockApp.use(anything())).once();
  });
});
