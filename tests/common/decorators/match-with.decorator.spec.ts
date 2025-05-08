import { MatchWith } from '@common/decorators';
import { validate } from 'class-validator';

class TestClass {
  password: string;

  @MatchWith('password', { message: 'Confirm does not match with password' })
  confirmPassword: string;
}

describe('MatchWith', () => {
  it('Should be validate matching pass', async () => {
    const testInstance = new TestClass();
    testInstance.password = 'password';
    testInstance.confirmPassword = 'password';

    const validationResponse = await validate(testInstance);
    expect(validationResponse).toHaveLength(0);
  });

  it('Should be validate matching not pass', async () => {
    const testInstance = new TestClass();
    testInstance.password = 'password';
    testInstance.confirmPassword = 'different password';

    const validationResponse = await validate(testInstance);
    expect(validationResponse).toHaveLength(1);
    expect(validationResponse[0].constraints).toHaveProperty('MatchWith');
    expect(validationResponse[0].constraints['MatchWith']).toBe(
      'Confirm does not match with password',
    );
  });

  it('Should be validate matching throw default error message', async () => {
    class DefaultErrorMsgClass {
      password: string;

      @MatchWith('password')
      confirmPassword: string;
    }

    const defaultErrorMsgInstance = new DefaultErrorMsgClass();
    defaultErrorMsgInstance.password = 'password';
    defaultErrorMsgInstance.confirmPassword = 'different password';

    const validationResponse = await validate(defaultErrorMsgInstance);
    expect(validationResponse).toHaveLength(1);
    expect(validationResponse[0].constraints).toHaveProperty('MatchWith');
    expect(validationResponse[0].constraints['MatchWith']).toBe(
      `password must match with confirmPassword`,
    );
  });

  it('Should be validation matching always not pass due to invalid property name', async () => {
    class InvalidPropertyTestClass {
      password: string;

      @MatchWith('invalidProperty', {
        message: 'Confirm does not match with password',
      })
      confirmPassword: string;
    }

    const invalidPropertyInstance = new InvalidPropertyTestClass();
    invalidPropertyInstance.password = 'password';
    invalidPropertyInstance.confirmPassword = 'password';

    const validationResponse = await validate(invalidPropertyInstance);
    expect(validationResponse).toHaveLength(1);
    expect(validationResponse[0].target['invalidProperty']).toBeUndefined();
  });
});
