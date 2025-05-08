import { SignInRequestBody } from '@modules/authentication/application/commands/sign-in/sign-in.request-body';
import { validate } from 'class-validator';

describe('SignInRequestBody', () => {
  it('Should pass validation successfully', async () => {
    const body = new SignInRequestBody();
    body.email = 'example@google.com';
    body.password = 'Abcd@123456';

    const validationResponse = await validate(body);

    expect(body).toBeDefined();
    expect(body).toEqual({
      email: 'example@google.com',
      password: 'Abcd@123456',
    });
    expect(validationResponse).toHaveLength(0);
  });

  it('Should throw error on invalid email', async () => {
    const body = new SignInRequestBody();
    body.email = 'invalid-email';
    body.password = 'Abcd@123456';

    const validationResponse = await validate(body);

    expect(validationResponse).toHaveLength(1);
    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        isEmail: 'Email is invalid',
      }),
    );
  });

  it('Should throw error if email too long', async () => {
    const body = new SignInRequestBody();
    body.email = Array.from({ length: 400 }, (_, i) => i).reduce(
      (acc) => 'e' + acc,
      'example@google.com',
    );
    body.password = 'Abcd@123456';

    const validationResponse = await validate(body);

    expect(validationResponse).toHaveLength(1);
    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        maxLength: 'Email must not exceed 320 characters',
      }),
    );
  });

  it('Should throw error on empty password', async () => {
    const body = new SignInRequestBody();
    body.email = 'example@google.com';
    body.password = '';

    const validationResponse = await validate(body);

    expect(validationResponse).toHaveLength(1);
    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        matches: 'Password must contain uppercase letters',
        minLength: 'Password must be at least 8 characters',
        isNotEmpty: 'Password is required',
      }),
    );
  });

  it('Should throw error on invalid password', async () => {
    const body = new SignInRequestBody();
    body.email = 'example@google.com';
    body.password = 123456789 as any;

    const validationResponse = await validate(body);

    expect(validationResponse).toHaveLength(1);
    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        matches: 'Password must contain uppercase letters',
        minLength: 'Password must be at least 8 characters',
        maxLength: 'Password must not exceed 100 characters',
        isString: 'Password must be a string',
      }),
    );
  });

  it('Should throw error if password too short', async () => {
    const body = new SignInRequestBody();
    body.email = 'example@google.com';
    body.password = 'Abcd@12';

    const validationResponse = await validate(body);

    expect(validationResponse).toHaveLength(1);
    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        minLength: 'Password must be at least 8 characters',
      }),
    );
  });

  it('Should throw error if password too long', async () => {
    const body = new SignInRequestBody();
    body.email = 'example@google.com';
    body.password = Array.from({ length: 100 }, (_, i) => i).reduce(
      (acc) => 'e' + acc,
      'Abcd@12',
    );

    const validationResponse = await validate(body);

    expect(validationResponse).toHaveLength(1);
    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        maxLength: 'Password must not exceed 100 characters',
      }),
    );
  });

  it('Should throw error if password does not contain uppercase', async () => {
    const body = new SignInRequestBody();
    body.email = 'example@google.com';
    body.password = 'abcd@1245678';

    const validationResponse = await validate(body);

    expect(validationResponse).toHaveLength(1);
    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        matches: 'Password must contain uppercase letters',
      }),
    );
  });

  it('Should throw error if password does not contain lowercase', async () => {
    const body = new SignInRequestBody();
    body.email = 'example@google.com';
    body.password = 'ABCD@1245678';

    const validationResponse = await validate(body);

    expect(validationResponse).toHaveLength(1);
    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        matches: 'Password must contain lowercase letters',
      }),
    );
  });

  it('Should throw error if password does not contain numbers', async () => {
    const body = new SignInRequestBody();
    body.email = 'example@google.com';
    body.password = 'ABCD@abcd';

    const validationResponse = await validate(body);

    expect(validationResponse).toHaveLength(1);
    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        matches: 'Password must contain numbers',
      }),
    );
  });

  it('Should throw error if password does not contain special character', async () => {
    const body = new SignInRequestBody();
    body.email = 'example@google.com';
    body.password = 'Abcd1234567';

    const validationResponse = await validate(body);

    expect(validationResponse).toHaveLength(1);
    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        matches: 'Password must contain at least one special character',
      }),
    );
  });
});
