import { Pagination } from '@common/factories';

describe('Pagination', () => {
  it('Should create pagination request', () => {
    const paginationDto = Pagination.of(
      {
        take: 10,
        skip: 10,
      },
      50,
      Array(10).fill('foo'),
    );

    expect(paginationDto).toBeDefined();
    expect(paginationDto).toEqual({
      skippedRecords: 10,
      totalRecords: 50,
      records: Array(10).fill('foo'),
      payloadSize: 10,
      hasNext: true,
    });
  });

  it('Should create pagination request, last page', () => {
    const paginationDto = Pagination.of(
      { take: 10, skip: 40 },
      50,
      Array(10).fill('foo'),
    );

    expect(paginationDto).toBeDefined();
    expect(paginationDto).toEqual({
      skippedRecords: 40,
      totalRecords: 50,
      records: Array(10).fill('foo'),
      payloadSize: 10,
      hasNext: false,
    });
  });
});
