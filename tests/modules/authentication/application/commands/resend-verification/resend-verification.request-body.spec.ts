import { ResendVerificationRequestBody } from '@modules/authentication/application/commands/resend-verification/resend-verification.request-body';
import { validate } from 'class-validator';

describe('ResendVerificationRequestBody', () => {
  it('Should pass validation successfully', async () => {
    const body = new ResendVerificationRequestBody();
    body.email = 'example@google.com';

    const validationResponse = await validate(body);

    expect(validationResponse).toBeDefined();
    expect(validationResponse).toHaveLength(0);
    expect(body).toEqual(
      expect.objectContaining({
        email: 'example@google.com',
      }),
    );
  });

  it('Should throw error on invalid email', async () => {
    const body = new ResendVerificationRequestBody();
    body.email = 'invalid-email';

    const validationResponse = await validate(body);

    expect(validationResponse).toBeDefined();
    expect(validationResponse).toHaveLength(1);
    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        isEmail: 'Email is invalid',
      }),
    );
  });

  it('Should throw error on empty email', async () => {
    const body = new ResendVerificationRequestBody();
    body.email = '';

    const validationResponse = await validate(body);

    expect(validationResponse).toBeDefined();
    expect(validationResponse).toHaveLength(1);
    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        isEmail: 'Email is invalid',
      }),
    );
  });

  it('Should throw error when email too long', async () => {
    const body = new ResendVerificationRequestBody();
    body.email = Array.from({ length: 400 }, (_, i) => i).reduce(
      (acc) => 'e' + acc,
      'example@google.com',
    );

    const validationResponse = await validate(body);

    expect(validationResponse).toBeDefined();
    expect(validationResponse).toHaveLength(1);
    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        maxLength: 'Email must not exceed 320 characters',
      }),
    );
  });
});
