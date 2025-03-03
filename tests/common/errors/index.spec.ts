import { getError, getStack } from '@common/errors';

class ExceptionFromError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

describe('Errors', () => {
  describe('getError', () => {
    test.each([
      [new Error('Somethings wrong')],
      [new ExceptionFromError('Custom error')],
    ])('%p should return itself', (error) => {
      expect(getError(error)).toBe(error);
    });

    test.each([
      ['Somethings wrong'],
      [123],
      { foo: 'custom message for Somethings wrong' },
      { name: 'ErrorLike', message: 'error message', stack: 'stack' },
    ])('%p should return new error instance', (error) => {
      const err = getError(error);
      expect(err).not.toBe(error);
    });

    test('should safely handle the cyclical object', () => {
      const obj = { message: 'something wrong' };
      Object.assign(obj, { prop: obj });

      expect(() => getError(obj)).not.toThrow();
    });

    test('should safely handle the undefined', () => {
      expect(() => getError(undefined)).not.toThrow();
    });
  });

  describe('getStack', () => {
    test('should convert stack to string array', () => {
      expect(getStack(new Error('something is wrong')).length).toBeGreaterThan(
        0,
      );
    });

    test('should safely handle empty stack', () => {
      const err = new Error('something is wrong');
      Object.assign(err, { stack: undefined });
      expect(getStack(err)).toHaveLength(0);
    });
  });
});
