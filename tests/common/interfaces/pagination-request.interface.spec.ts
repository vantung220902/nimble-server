import { PaginationRequest } from '@common/interfaces';

describe('PaginationRequest', () => {
  it('Should initialize PaginationRequest correctly', () => {
    const paginationRequest: PaginationRequest = {
      skip: 10,
      take: 10,
      params: {
        skip: 10,
        take: 10,
      },
    };

    expect(paginationRequest).toBeDefined();
    expect(paginationRequest).toEqual({
      skip: 10,
      take: 10,
      params: {
        skip: 10,
        take: 10,
      },
    });
  });
});
