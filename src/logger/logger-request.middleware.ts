import { NextFunction } from 'express';

const decodeJwt = (token: string) => {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
};

export function loggerRequestMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const authorization = req.headers['authorization'];

  if (authorization) {
    // add custom headers to increase traceability of the requests auto logs
    const data = decodeJwt(authorization);
    req.headers['x-request-sub'] = data.sub;
    req.headers['x-request-user-id'] = data.sub;
    req.headers['x-request-username'] = data.email;
  }

  next();
}
