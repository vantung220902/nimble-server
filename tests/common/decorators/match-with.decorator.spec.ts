import { MatchWith } from '@common/decorators/match-with.decorator';
import { validate } from 'class-validator';

class SignUpRequestBody {
  password: string;

  @MatchWith('password')
  confirmPassword: string;

  constructor(password: string, confirmPassword: string) {
    this.password = password;
    this.confirmPassword = confirmPassword;
  }
}

describe('MatchWithDecorator', () => {
  const mockPassword = 'password';
  let mockConfirmPassword = 'password';

  it('should pass validation when values match', async () => {
    const dto = new SignUpRequestBody(mockPassword, mockConfirmPassword);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when values do not match', async () => {
    mockConfirmPassword = 'different';
    const dto = new SignUpRequestBody(mockPassword, mockConfirmPassword);
    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty('MatchWith');
    expect(errors[0].constraints?.MatchWith).toBe(
      'password must match with confirmPassword',
    );
  });

  it('should handle undefined values', async () => {
    const dto = new SignUpRequestBody(mockPassword, undefined);
    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty('MatchWith');
  });

  it('should handle null values', async () => {
    const dto = new SignUpRequestBody(mockPassword, null);
    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty('MatchWith');
  });
});
