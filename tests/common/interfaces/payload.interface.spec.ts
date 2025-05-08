import { RequestUser } from '@common/interfaces';
import dayjs from 'dayjs';

describe('RequestUser', () => {
  it('Should initialize RequestUser correctly', () => {
    const requestUser: RequestUser = {
      sub: 'id',
      status: 'Active',
      email: 'test@gmail.com',
      iat: 1617281718,
      exp: 1617285318,
    };

    expect(requestUser).toBeDefined();
    expect(dayjs(requestUser.exp).format('YYYY-MM-DD')).toEqual('1970-01-20');
    expect(dayjs(requestUser.iat).format('YYYY-MM-DD')).toEqual('1970-01-20');
  });
});
