import { noContent, useServingFavIcon } from '@common/middlewares';
import { INestApplication } from '@nestjs/common';
import { anything, instance, mock, verify } from 'ts-mockito';

describe('useServingFavIcon', () => {
  test('should serve /favicon.ico', () => {
    const mockApp = mock<INestApplication>();
    useServingFavIcon(instance(mockApp));
    verify(mockApp.use('/favicon.ico', anything())).once();
  });

  test('should return 204 no_content', () => {
    const mockReq = mock<any>();
    const mockRes = mock<any>();

    noContent(instance(mockReq), instance(mockRes));
    verify(mockRes.sendStatus(204)).once();
  });
});
