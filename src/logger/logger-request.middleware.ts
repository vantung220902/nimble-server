import { NextFunction } from 'express';

const decodeJwt = (token: string) => {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
};

export function loggerRequestMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authorization = req.headers['authorization'];

  if (authorization) {
    const data = decodeJwt(authorization);
    req.headers['x-request-sub'] = data.sub;
    req.headers['x-request-user-id'] = data.user_id;
    const username = data['preferred_username'] || data['cognito:username'];
    req.headers['x-request-username'] = username;
  }

  next();
}
