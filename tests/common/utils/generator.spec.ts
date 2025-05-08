import { filterOperationByMode, normalizeFileName } from '@common/utils';
import { Prisma } from '@prisma/client';

describe('Generator', () => {
  describe('filterOperationByMode', () => {
    it('Should return filter operation with search and mode', () => {
      const filterOperation = filterOperationByMode(
        'test',
        Prisma.QueryMode.default,
      );

      expect(filterOperation).toEqual({
        contains: 'test',
        mode: Prisma.QueryMode.default,
      });
    });

    it('Should return filter operation with default mode', () => {
      const defaultFilterMode = filterOperationByMode('test');

      expect(defaultFilterMode).toEqual({
        contains: 'test',
        mode: Prisma.QueryMode.insensitive,
      });
    });

    it('Should return undefined without search', () => {
      const withoutSearchFilter = filterOperationByMode();

      expect(withoutSearchFilter).toBeUndefined();
    });
  });

  describe('normalizeFileName', () => {
    it('Should replace non-alphanumeric characters with underscores', () => {
      const filename = normalizeFileName('keyword file@@.csv');

      expect(filename).toEqual('keyword_file__.csv');
    });

    it('Should transform filename to lowercase', () => {
      const filename = normalizeFileName('KEYWORD FILE@@.csv');

      expect(filename).toEqual('keyword_file__.csv');
    });

    it('Should replace non-alphanumeric characters and transform to lower case', () => {
      const filename = normalizeFileName('Keyword File@@.csv');

      expect(filename).toEqual('keyword_file__.csv');
    });

    it('Should handle filename already transformed', () => {
      const filename = normalizeFileName('keyword_file__.csv');

      expect(filename).toEqual('keyword_file__.csv');
    });

    it('Should handle all non-alphanumeric characters', () => {
      const filename = normalizeFileName('@@@');

      expect(filename).toEqual('___');
    });

    it('Should handle empty string', () => {
      const filename = normalizeFileName('');

      expect(filename).toBeUndefined();
    });
  });
});
