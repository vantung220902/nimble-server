import { ToBoolean } from '@common/decorators';
import { instanceToPlain } from 'class-transformer';

describe('ToBoolean', () => {
  class TestClass {
    @ToBoolean()
    public booleanProp?: boolean;

    @ToBoolean()
    public stringProp?: string;

    @ToBoolean()
    public nonConvertibleProp?: number;
  }

  it('should transform a boolean property into the same boolean', () => {
    const testInstance = new TestClass();
    testInstance.booleanProp = true;

    const transformed = instanceToPlain(testInstance);

    expect(transformed.booleanProp).toBe(true);
  });

  it('should transform a "true" string property into true', () => {
    const testInstance = new TestClass();
    testInstance.stringProp = 'true';

    const transformed = instanceToPlain(testInstance);

    expect(transformed.stringProp).toBe(true);
  });

  it('should transform a "false" string property into false', () => {
    const testInstance = new TestClass();
    testInstance.stringProp = 'false';

    const transformed = instanceToPlain(testInstance);

    expect(transformed.stringProp).toBe(false);
  });

  it('should transform an undefined property into undefined', () => {
    const testInstance = new TestClass();

    const transformed = instanceToPlain(testInstance);

    expect(transformed.booleanProp).toBeUndefined();
  });

  it('should transform a non-convertible property into undefined', () => {
    const testInstance = new TestClass();
    testInstance.nonConvertibleProp = 123;

    const transformed = instanceToPlain(testInstance);

    expect(transformed.nonConvertibleProp).toBeUndefined();
  });
});
