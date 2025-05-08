import { ToBoolean } from '@common/decorators';
import { instanceToPlain } from 'class-transformer';

describe('ToBoolean', () => {
  class TestClass {
    @ToBoolean()
    booleanProps?: boolean;

    @ToBoolean()
    stringProps?: string;

    @ToBoolean()
    nonConvertibleProps?: number;
  }

  it('Should transform boolean property into the same boolean value', () => {
    const testInstance = new TestClass();

    testInstance.booleanProps = true;
    const transformedTrue: TestClass = instanceToPlain(testInstance);

    testInstance.booleanProps = false;
    const transformedFalse: TestClass = instanceToPlain(testInstance);

    expect(transformedTrue.booleanProps).toEqual(true);
    expect(transformedFalse.booleanProps).toEqual(false);
  });

  it('Should transform string property "true" into true value', () => {
    const testInstance = new TestClass();

    testInstance.stringProps = 'true';
    const transformed: TestClass = instanceToPlain(testInstance);

    expect(transformed.stringProps).toEqual(true);
  });

  it('Should transform string property not "true" into false value', () => {
    const testInstance = new TestClass();

    testInstance.stringProps = 'false';
    const transformedFalseStr: TestClass = instanceToPlain(testInstance);

    testInstance.stringProps = 'not boolean';
    const transformedStr: TestClass = instanceToPlain(testInstance);

    expect(transformedFalseStr.stringProps).toEqual(false);
    expect(transformedStr.stringProps).toEqual(false);
  });

  it('Should cannot transform number property', () => {
    const testInstance = new TestClass();

    testInstance.nonConvertibleProps = 1;
    const transformedNumber: TestClass = instanceToPlain(testInstance);

    expect(transformedNumber.nonConvertibleProps).toBeUndefined();
  });

  it('Should transform null value into the same', () => {
    const testInstance = new TestClass();

    testInstance.nonConvertibleProps = null;
    testInstance.booleanProps = null;
    testInstance.stringProps = null;

    const transformedNull: TestClass = instanceToPlain(testInstance);

    expect(transformedNull.nonConvertibleProps).toBeNull();
    expect(transformedNull.booleanProps).toBeNull();
    expect(transformedNull.stringProps).toBeNull();
  });

  it('Should transform undefined property into the same', () => {
    const testInstance = new TestClass();

    const transformedUndefined: TestClass = instanceToPlain(testInstance);

    expect(transformedUndefined.nonConvertibleProps).toBeUndefined();
    expect(transformedUndefined.booleanProps).toBeUndefined();
    expect(transformedUndefined.stringProps).toBeUndefined();
  });
});
