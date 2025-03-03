import { useLogger } from '@logger';
import { INestApplication } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { anything, instance, mock, verify, when } from 'ts-mockito';

describe('useLogger', () => {
  test('should call useLogger middleware', () => {
    const mockApp = mock<INestApplication>();
    const mockLogger = mock(Logger) as any;

    when(mockApp.get(Logger)).thenResolve(instance(mockLogger));

    useLogger(instance(mockApp));

    verify(mockApp.get(Logger)).once();
    verify(mockApp.useLogger(anything())).once();
  });
});
