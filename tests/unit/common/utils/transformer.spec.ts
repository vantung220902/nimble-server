import { trim } from '@common/utils/transformer';

describe('TransformerUtils', () => {
  describe('trim', () => {
    test('should trim whitespace from string value', () => {
      expect(trim({ value: ' Nimble ' })).toBe('Nimble');
    });

    test('should return undefined for null value', () => {
      expect(trim({ value: null })).toBeNull();
    });

    test('should handle string with no whitespace', () => {
      expect(trim({ value: 'Nimble' })).toBe('Nimble');
    });

    test('should handle string with only whitespace', () => {
      expect(trim({ value: '  ' })).toBe('');
    });
  });
});
