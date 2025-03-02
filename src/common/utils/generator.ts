import { Prisma } from '@prisma/client';

export const filterOperationByMode = (
  search?: string,
  mode: Prisma.QueryMode = Prisma.QueryMode.insensitive,
): Prisma.StringFilter | undefined => {
  return search ? { contains: search, mode } : undefined;
};

export const normalizeFileName = (str?: string) => {
  return str ? str.replace(/[^a-z0-9.]/gi, '_').toLowerCase() : undefined;
};
