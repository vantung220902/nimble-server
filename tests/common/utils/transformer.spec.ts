import { trim } from '@common/utils';

describe('Transformer', () => {
  describe('trim', () => {
    it('Should trim whitespace from string value', () => {
      const trimmed = trim({ value: '  Nimble   ' });

      expect(trimmed).toEqual('Nimble');
    });

    it('Should return null when value is nullable', () => {
      const trimmed = trim({ value: null });

      expect(trimmed).toBeNull();
    });

    it('Should return undefined when value is undefined', () => {
      const trimmed = trim({ value: undefined });

      expect(trimmed).toBeUndefined();
    });

    it('Should return same value if not have whitespace', () => {
      const value = 'Nimble';
      const trimmed = trim({ value: value });

      expect(trimmed).toEqual(value);
    });

    it('Should handle all whitespace characters', () => {
      const trimmed = trim({ value: '         ' });

      expect(trimmed).toEqual('');
    });
  });
});
