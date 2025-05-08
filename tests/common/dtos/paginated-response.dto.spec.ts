import { PaginatedApiResponseDto } from '@common/dtos';

class MockRecord {
  id: number;
  name: string;
}

const mockTotalRecords: MockRecord[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Record ${i + 1}`,
}));
const mockRecords: MockRecord[] = [
  {
    id: 1,
    name: 'Record 1',
  },
  {
    id: 2,
    name: 'Record 2',
  },
  {
    id: 3,
    name: 'Record 3',
  },
];

describe('PaginatedApiResponseDto', () => {
  const testInstance = new PaginatedApiResponseDto<MockRecord>();

  beforeEach(() => {
    testInstance.hasNext = mockRecords.length < mockTotalRecords.length;
    testInstance.payloadSize = mockRecords.length;
    testInstance.records = mockRecords;
    testInstance.totalRecords = mockTotalRecords.length;
    testInstance.skippedRecords = 0;
  });

  it('Should initialize correctly all properties', () => {
    expect(testInstance.hasNext).toEqual(true);
    expect(testInstance.payloadSize).toEqual(mockRecords.length);
    expect(testInstance.records).toHaveLength(mockRecords.length);
    expect(testInstance.totalRecords).toEqual(mockTotalRecords.length);
    expect(testInstance.skippedRecords).toEqual(0);
  });

  it('Should initialize record correctly with generic type', () => {
    testInstance.records.forEach((record) => {
      expect(record).toHaveProperty('id');
      expect(record).toHaveProperty('name');
      expect(typeof record.id).toEqual('number');
      expect(typeof record.name).toEqual('string');
    });
  });

  it('Should handle employ array records', () => {
    testInstance.records = [];
    testInstance.payloadSize = 0;
    testInstance.hasNext = false;

    expect(testInstance.records).toHaveLength(0);
    expect(testInstance.hasNext).toEqual(false);
    expect(testInstance.payloadSize).toEqual(0);
  });
});
