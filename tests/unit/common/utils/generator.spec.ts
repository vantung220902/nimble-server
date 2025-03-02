import { filterOperationByMode } from '@common/utils/generator';
import { Prisma } from '@prisma/client';

describe('GeneratorUtils', () => {
  describe('filterOperationByMode', () => {
    test('should return undefined if search param does not valid', () => {
      expect(
        filterOperationByMode(undefined, Prisma.QueryMode.insensitive),
      ).toBeUndefined();
    });

    test('should return filter operation by mode', () => {
      expect(
        filterOperationByMode('test', Prisma.QueryMode.insensitive),
      ).toEqual({
        contains: 'test',
        mode: Prisma.QueryMode.insensitive,
      });
    });

    test('should return filter operation by default mode', () => {
      expect(filterOperationByMode('test')).toEqual({
        contains: 'test',
        mode: Prisma.QueryMode.insensitive,
      });
    });
  });
});
