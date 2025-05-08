import { ApiListResponseDto, ApiResponseDto } from '@common/dtos';
import dayjs from 'dayjs';

class MockRecord {
  id: number;
  name: string;
}
const mockRecord: MockRecord = {
  id: 1,
  name: 'Record 1',
};

describe('ApiResponseDto', () => {
  const testInstance = new ApiResponseDto<MockRecord>();
  it('Should initialize correctly properties with generic type', () => {
    testInstance.code = 200;
    testInstance.data = mockRecord;
    testInstance.success = true;
    testInstance.timestamp = 1740646277;

    expect(testInstance.code).toEqual(200);
    expect(testInstance.data).toEqual(mockRecord);
    expect(testInstance.success).toEqual(true);
    expect(testInstance.timestamp).toEqual(1740646277);
    expect(dayjs(testInstance.timestamp).format('YYYY-MM-DD')).toEqual(
      '1970-01-21',
    );
  });

  it('Should initialize record correctly with generic type', () => {
    expect(testInstance.data).toHaveProperty('id');
    expect(testInstance.data).toHaveProperty('name');
    expect(typeof testInstance.data.id).toEqual('number');
    expect(typeof testInstance.data.name).toEqual('string');
  });

  it('Should handle not pass generic type', () => {
    const testUndefinedInstance = new ApiResponseDto();
    testUndefinedInstance.code = 200;
    testUndefinedInstance.success = true;
    testUndefinedInstance.timestamp = 1740646277;

    expect(testUndefinedInstance.code).toEqual(200);
    expect(testUndefinedInstance.data).toBeUndefined();
    expect(testUndefinedInstance.success).toEqual(true);
    expect(testUndefinedInstance.timestamp).toEqual(1740646277);
    expect(dayjs(testUndefinedInstance.timestamp).format('YYYY-MM-DD')).toEqual(
      '1970-01-21',
    );
  });
});

describe('ApiListResponseDto', () => {
  const testInstance = new ApiListResponseDto<MockRecord>();
  it('Should initialize correctly properties with generic type', () => {
    testInstance.code = 200;
    testInstance.data = Array.from({ length: 3 }, (_, i) => ({
      id: i + 1,
      name: `Record ${i + 1}`,
    }));
    testInstance.success = true;
    testInstance.timestamp = 1740646277;

    expect(testInstance.code).toEqual(200);
    expect(testInstance.data).toHaveLength(3);
    expect(testInstance.success).toEqual(true);
    expect(testInstance.timestamp).toEqual(1740646277);
    expect(dayjs(testInstance.timestamp).format('YYYY-MM-DD')).toEqual(
      '1970-01-21',
    );
  });

  it('Should initialize record correctly with generic type', () => {
    testInstance.data.forEach((record) => {
      expect(record).toHaveProperty('id');
      expect(record).toHaveProperty('name');
      expect(typeof record.id).toEqual('number');
      expect(typeof record.name).toEqual('string');
    });
  });

  it('Should handle not pass generic type', () => {
    const testUndefinedInstance = new ApiListResponseDto();
    testUndefinedInstance.code = 200;
    testUndefinedInstance.success = true;
    testUndefinedInstance.timestamp = 1740646277;

    expect(testUndefinedInstance.code).toEqual(200);
    expect(testUndefinedInstance.data).toBeUndefined();
    expect(testUndefinedInstance.success).toEqual(true);
    expect(testUndefinedInstance.timestamp).toEqual(1740646277);
    expect(dayjs(testUndefinedInstance.timestamp).format('YYYY-MM-DD')).toEqual(
      '1970-01-21',
    );
  });
});
