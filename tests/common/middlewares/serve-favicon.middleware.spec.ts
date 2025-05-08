import { noContent, useServingFavIcon } from '@common/middlewares';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Request, Response } from 'express';
import { anything, instance, mock, verify } from 'ts-mockito';

describe('useServingFavIcon', () => {
  it('Should server /favicon.ico', () => {
    const mockApp = mock<INestApplication>();

    useServingFavIcon(instance(mockApp));
    verify(mockApp.use('/favicon.ico', anything())).once();
  });

  it('Should return 204 NO_CONTENT', () => {
    const mockRes = mock<Response>();
    const mockReq = mock<Request>();

    noContent(instance(mockReq), instance(mockRes));
    verify(mockRes.sendStatus(HttpStatus.NO_CONTENT)).once();
  });
});
