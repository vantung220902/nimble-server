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
  it('should pass validation when values match', async () => {
    const dto = new SignUpRequestBody('password123', 'password123');
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when values do not match', async () => {
    const dto = new SignUpRequestBody('password123', 'different');
    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty('MatchWith');
    expect(errors[0].constraints?.MatchWith).toBe(
      'password must match with confirmPassword',
    );
  });

  it('should handle undefined values', async () => {
    const dto = new SignUpRequestBody('password123', undefined as any);
    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty('MatchWith');
  });

  it('should handle null values', async () => {
    const dto = new SignUpRequestBody('password123', null as any);
    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty('MatchWith');
  });
});
