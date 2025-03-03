import {
  filterOperationByMode,
  normalizeFileName,
} from '@common/utils/generator';
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

  describe('normalizeFileName', () => {
    test('should return undefined if input is undefined', () => {
      expect(normalizeFileName(undefined)).toBeUndefined();
    });

    test('should replace non-alphanumeric characters with underscores and convert to lowercase', () => {
      expect(normalizeFileName('Keyword File@@.csv')).toEqual(
        'keyword_file__.csv',
      );
    });

    test('should handle strings with no special characters', () => {
      expect(normalizeFileName('keywords.csv')).toEqual('keywords.csv');
    });

    test('should handle strings with only special characters', () => {
      expect(normalizeFileName('@@@')).toEqual('___');
    });

    test('should handle empty strings', () => {
      expect(normalizeFileName('')).toBeUndefined();
    });
  });
});
