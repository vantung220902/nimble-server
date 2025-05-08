import { SignUpRequestBody } from '@modules/authentication/application/commands/sign-up/sign-up.request-body';
import { validate } from 'class-validator';

describe('SignUpRequestBody', () => {
  it('Should pass validation successfully', async () => {
    const body = new SignUpRequestBody();
    body.confirmPassword = 'Abcd@123456';
    body.password = 'Abcd@123456';
    body.email = 'test@gmail.com';
    body.firstName = 'Tung';
    body.lastName = 'Nguyen';

    const validationResponse = await validate(body);

    expect(body).toBeDefined();
    expect(body).toEqual({
      confirmPassword: 'Abcd@123456',
      password: 'Abcd@123456',
      email: 'test@gmail.com',
      firstName: 'Tung',
      lastName: 'Nguyen',
    });
    expect(validationResponse).toHaveLength(0);
  });

  it('Should throw error if invalid email', async () => {
    const body = new SignUpRequestBody();
    body.email = 'invalid-email';

    const validationResponse = await validate(body);

    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        isEmail: 'Email is invalid',
      }),
    );
  });

  it('Should throw error if email too long', async () => {
    const body = new SignUpRequestBody();
    body.email = Array.from({ length: 400 }, (_, i) => i).reduce(
      (acc) => 'e' + acc,
      'example@google.com',
    );

    const validationResponse = await validate(body);

    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        maxLength: 'Email must not exceed 320 characters',
      }),
    );
  });

  it('Should throw error if password is empty', async () => {
    const body = new SignUpRequestBody();
    body.password = '';
    body.email = 'test@gmail.com';

    const validationResponse = await validate(body);

    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        matches: 'Password must contain uppercase letters',
        minLength: 'Password must be at least 8 characters',
        isNotEmpty: 'Password is required',
      }),
    );
  });

  it('Should throw error on invalid password', async () => {
    const body = new SignUpRequestBody();
    body.email = 'example@google.com';
    body.password = 123456789 as any;

    const validationResponse = await validate(body);

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
    const body = new SignUpRequestBody();
    body.email = 'example@google.com';
    body.password = 'Abcd@12';

    const validationResponse = await validate(body);

    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        minLength: 'Password must be at least 8 characters',
      }),
    );
  });

  it('Should throw error if password too long', async () => {
    const body = new SignUpRequestBody();
    body.email = 'example@google.com';
    body.password = Array.from({ length: 100 }, (_, i) => i).reduce(
      (acc) => 'e' + acc,
      'Abcd@12',
    );

    const validationResponse = await validate(body);

    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        maxLength: 'Password must not exceed 100 characters',
      }),
    );
  });

  it('Should throw error if password does not contain uppercase', async () => {
    const body = new SignUpRequestBody();
    body.email = 'example@google.com';
    body.password = 'abcd@1245678';

    const validationResponse = await validate(body);

    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        matches: 'Password must contain uppercase letters',
      }),
    );
  });

  it('Should throw error if password does not contain lowercase', async () => {
    const body = new SignUpRequestBody();
    body.email = 'example@google.com';
    body.password = 'ABCD@1245678';

    const validationResponse = await validate(body);

    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        matches: 'Password must contain lowercase letters',
      }),
    );
  });

  it('Should throw error if password does not contain numbers', async () => {
    const body = new SignUpRequestBody();
    body.email = 'example@google.com';
    body.password = 'ABCD@abcd';

    const validationResponse = await validate(body);

    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        matches: 'Password must contain numbers',
      }),
    );
  });

  it('Should throw error if password does not contain special character', async () => {
    const body = new SignUpRequestBody();
    body.email = 'example@google.com';
    body.password = 'Abcd1234567';

    const validationResponse = await validate(body);

    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        matches: 'Password must contain at least one special character',
      }),
    );
  });

  it('Should throw error if confirm password is empty', async () => {
    const body = new SignUpRequestBody();
    body.email = 'example@google.com';
    body.password = 'Abcd@123456';
    body.confirmPassword = '';

    const validationResponse = await validate(body);

    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        MatchWith: 'Confirm password does not match with password',
        isNotEmpty: 'Confirm password is required',
      }),
    );
  });

  it('Should throw error if confirm password invalid', async () => {
    const body = new SignUpRequestBody();
    body.email = 'example@google.com';
    body.password = 'Abcd@123456';
    body.confirmPassword = 123123132 as any;

    const validationResponse = await validate(body);

    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        MatchWith: 'Confirm password does not match with password',
        isString: 'Confirm password must be a string',
      }),
    );
  });

  it('Should throw error if confirm password not match with password', async () => {
    const body = new SignUpRequestBody();
    body.email = 'example@google.com';
    body.password = 'Abcd@123456';
    body.confirmPassword = 'Abcd@1234567';

    const validationResponse = await validate(body);

    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        MatchWith: 'Confirm password does not match with password',
      }),
    );
  });

  it('Should throw error if first name is empty', async () => {
    const body = new SignUpRequestBody();
    body.email = 'example@google.com';
    body.password = 'Abcd@123456';
    body.confirmPassword = 'Abcd@123456';
    body.firstName = '';

    const validationResponse = await validate(body);

    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        isNotEmpty: 'First name is required',
      }),
    );
  });

  it('Should throw error if first name too long', async () => {
    const body = new SignUpRequestBody();
    body.email = 'example@google.com';
    body.password = 'Abcd@123456';
    body.confirmPassword = 'Abcd@123456';
    body.firstName = Array.from({ length: 100 }, (_, i) => i).reduce(
      (acc) => 'e' + acc,
      'Tung',
    );

    const validationResponse = await validate(body);

    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        maxLength: 'First name must not exceed 100 characters',
      }),
    );
  });

  it('Should throw error if first name invalid', async () => {
    const body = new SignUpRequestBody();
    body.email = 'example@google.com';
    body.password = 'Abcd@123456';
    body.confirmPassword = 'Abcd@123456';
    body.firstName = 123123123 as any;

    const validationResponse = await validate(body);

    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        isString: 'First name must be a string',
      }),
    );
  });

  it('Should throw error if last name is empty', async () => {
    const body = new SignUpRequestBody();
    body.email = 'example@google.com';
    body.password = 'Abcd@123456';
    body.confirmPassword = 'Abcd@123456';
    body.firstName = 'Tung';
    body.lastName = '';

    const validationResponse = await validate(body);

    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        isNotEmpty: 'Last name is required',
      }),
    );
  });

  it('Should throw error if first name too long', async () => {
    const body = new SignUpRequestBody();
    body.email = 'example@google.com';
    body.password = 'Abcd@123456';
    body.confirmPassword = 'Abcd@123456';
    body.firstName = 'Tung';
    body.lastName = Array.from({ length: 100 }, (_, i) => i).reduce(
      (acc) => 'e' + acc,
      'Tung',
    );

    const validationResponse = await validate(body);

    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        maxLength: 'Last name must not exceed 100 characters',
      }),
    );
  });

  it('Should throw error if first name invalid', async () => {
    const body = new SignUpRequestBody();
    body.email = 'example@google.com';
    body.password = 'Abcd@123456';
    body.confirmPassword = 'Abcd@123456';
    body.firstName = 'Tung';
    body.lastName = 123123123 as any;

    const validationResponse = await validate(body);

    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        isString: 'Last name must be a string',
      }),
    );
  });
});
