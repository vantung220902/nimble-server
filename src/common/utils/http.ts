import { Request } from 'express';

export const getTokenFromHeader = (headers: Request['headers']) => {
  const [type, token] = headers['authorization']?.split(' ') ?? [];

  return type === 'Bearer' ? token : undefined;
};
