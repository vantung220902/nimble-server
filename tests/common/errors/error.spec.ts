import {
  getError,
  getStack,
  instanceOfError,
  isError,
  toError,
} from '@common/errors';

class ExceptionError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

describe('toError', () => {
  it('Should initialize new Error correctly', () => {
    const errMsg = 'Error';
    const errObj = { message: 'Error' };
    const errNumber = 400;

    expect(toError(errMsg).message).toEqual(JSON.stringify(String(errMsg)));
    expect(toError(errObj).message).toEqual(JSON.stringify(errObj));
    expect(toError(errNumber).message).toEqual(errNumber.toString());
  });
});

describe('isError', () => {
  const shouldBeTrue = test.each([
    new Error('Something wrong!'),
    new ExceptionError('Throws exception!'),
  ]);

  shouldBeTrue('%p should return true', (error) => {
    expect(isError(error)).toEqual(true);
  });

  const shouldBeFalse = test.each([
    'Something wrong!',
    'Throws exception!',
    400,
    { name: 'ErrorLike', message: 'error message', stack: 'stack' },
  ]);

  shouldBeFalse('%p should return false', (error) => {
    expect(isError(error)).toEqual(false);
  });
});

describe('instanceOfError', () => {
  const shouldBeTrue = test.each([
    new Error('Something wrong!'),
    new ExceptionError('Throws exception!'),
  ]);

  shouldBeTrue('%p should return true', (error) => {
    expect(instanceOfError(error)).toEqual(true);
  });

  const shouldBeFalse = test.each([
    'Something wrong!',
    'Throws exception!',
    400,
    undefined,
    null,
    { name: 'ErrorLike', message: 'error message', stack: 'stack' },
  ]);

  shouldBeFalse('%p should return false', (error) => {
    expect(instanceOfError(error)).toEqual(false);
  });
});

describe('getStack', () => {
  it('Should convert error stack to string array', () => {
    const error = new Error('Something wrong!');
    expect(getStack(error).length).toBeGreaterThan(0);
  });

  it('Should get correctly number error stack', () => {
    const error = new Error('Something wrong!');
    const mockErrorStack: Error = {
      ...error,
      stack: `at: some where
       at: some where
       at: some where
       at: some where`,
    };

    expect(getStack(mockErrorStack)).toHaveLength(
      mockErrorStack.stack.split('\n').length,
    );
  });

  it('Should handle empty error stack', () => {
    const error = new Error('Something wrong!');
    const emptyErrorStack: Error = {
      ...error,
      stack: undefined,
    };

    expect(getStack(emptyErrorStack)).toHaveLength(0);
  });
});

describe('getError', () => {
  const shouldBeError = test.each([
    new Error('Something wrong!'),
    new ExceptionError('Throws exception!'),
  ]);

  shouldBeError('%p should return itself', (error) => {
    expect(getError(error)).toBe(error);
  });

  const shouldNotBeError = test.each([
    'Something wrong!',
    'Throws exception!',
    400,
    null,
    { name: 'ErrorLike', message: 'error message', stack: 'stack' },
  ]);

  shouldNotBeError('%p should new error instance', (error) => {
    expect(instanceOfError(error)).not.toBe(error);
  });

  test('Should handle the undefined error', () => {
    expect(() => getError(undefined)).not.toThrow();
  });

  test('Should handle the cyclical object', () => {
    const errObj = { message: 'Something wrong!' };
    Object.assign(errObj, { prop: errObj });

    expect(() => getError(errObj)).not.toThrow();
  });
});
