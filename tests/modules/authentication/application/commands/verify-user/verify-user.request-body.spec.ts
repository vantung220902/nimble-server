import { AuthenticationValidationConstraint } from '@modules/authentication';
import { VerifyUserRequestBody } from '@modules/authentication/application/commands/verify-user/verify-user.request-body';
import { validate } from 'class-validator';

describe('VerifyUserRequestBody', () => {
  it('Should pass validation successfully', async () => {
    const body = new VerifyUserRequestBody();
    body.email = 'test@gmail.com';
    body.code = '123456';

    const validationResponse = await validate(body);

    expect(body).toEqual({
      email: 'test@gmail.com',
      code: '123456',
    });
    expect(validationResponse).toHaveLength(0);
  });

  it('Should throw error if email invalid', async () => {
    const body = new VerifyUserRequestBody();
    body.email = 'invalid-email';

    const validationResponse = await validate(body);

    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        isEmail: 'Email is invalid',
      }),
    );
  });

  it('Should throw error if email too long', async () => {
    const body = new VerifyUserRequestBody();
    body.email = Array.from(
      {
        length: AuthenticationValidationConstraint.EMAIL_MAX_LENGTH,
      },
      (_, i) => i,
    ).reduce((acc, _) => 'e' + acc, 'test@gmail.com');

    const validationResponse = await validate(body);

    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        maxLength: 'Email must not exceed 320 characters',
      }),
    );
  });

  it('Should throw error if code invalid', async () => {
    const body = new VerifyUserRequestBody();
    body.email = 'test@gmail.com';
    body.code = 1234561 as any;

    const validationResponse = await validate(body);

    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        isString: 'Code must be a string',
        isLength: 'Verification code must be 6-digit',
      }),
    );
  });

  it('Should throw error if code is empty', async () => {
    const body = new VerifyUserRequestBody();
    body.email = 'test@gmail.com';
    body.code = '';

    const validationResponse = await validate(body);

    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        isNotEmpty: 'Code is required',
        isLength: 'Verification code must be 6-digit',
      }),
    );
  });
});
