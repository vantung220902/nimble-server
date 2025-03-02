import { HttpStatus, INestApplication } from '@nestjs/common';

export function noContent(_req: any, res: any) {
  return res.sendStatus(HttpStatus.NO_CONTENT);
}

export function useServingFavIcon(app: INestApplication) {
  app.use('/favicon.ico', noContent);
}
