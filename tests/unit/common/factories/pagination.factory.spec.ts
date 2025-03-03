import { Pagination } from '@common/factories';

describe('PaginationFactory', () => {
  test('should create pagination request', () => {
    const dto = Pagination.of(
      {
        skip: 250,
        take: 100,
      },
      1000,
      Array(100).fill('Nimble'),
    );

    expect(dto).toEqual({
      skippedRecords: 250,
      totalRecords: 1000,
      payloadSize: 100,
      hasNext: true,
      records: Array(100).fill('Nimble'),
    });
  });

  test('should create pagination request, last page', () => {
    const dto = Pagination.of(
      {
        skip: 950,
        take: 100,
      },
      1000,
      Array(50).fill('Nimble'),
    );

    expect(dto).toEqual({
      skippedRecords: 950,
      totalRecords: 1000,
      payloadSize: 50,
      hasNext: false,
      records: Array(50).fill('Nimble'),
    });
  });
});
