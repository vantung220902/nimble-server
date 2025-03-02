import { Request } from 'express';

export const getTokenFromHeader = (headers: Request['headers']) => {
  const [type, token] = headers['authorization']?.split(' ') ?? [];

  return type === 'Bearer' ? token : undefined;
};

export const waiter = (timeout: number) =>
  new Promise((resolve) => setTimeout(resolve, timeout));
