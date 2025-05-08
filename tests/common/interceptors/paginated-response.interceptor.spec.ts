import { PaginatedResponseInterceptor } from '@common/interceptors';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { from } from 'rxjs';
import { instance, mock, when } from 'ts-mockito';

expect.extend({
  toEqualAnyOf(received: any, argument: any[]) {
    const found = argument.some((eqItem) => {
      if (typeof eqItem === 'undefined' && typeof received === 'undefined')
        return true;

      if (eqItem === null && received === null) return false;

      try {
        expect(received).toEqual(eqItem);
        return true;
      } catch (error) {
        return false;
      }
    });

    return found
      ? {
          message: () => 'OK',
          pass: true,
        }
      : {
          message: () => `expected ${received} to be any of of ${argument}`,
          pass: false,
        };
  },
});

describe('PaginatedResponseInterceptor', () => {
  const mockExecution = mock<ExecutionContext>();
  const mockHandler = mock<CallHandler>();

  const testCases = test.each([
    { text: 'data' },
    'string data',
    123,
    ['array item 1', 'array item 2'],
    undefined,
    null,
    new Error('Something wrong!'),
    {
      skippedRecords: 100,
      totalRecords: 1000,
      records: Array(10).fill('foo'),
      payloadSize: 100,
      hasNext: true,
    },
  ]);

  testCases(
    'should transform %p to { skippedRecords, totalRecords, records, payloadSize, hasNext }',
    (data: any, done: jest.DoneCallback) => {
      const observable = from([data]);
      when(mockHandler.handle()).thenReturn(observable);

      const result = new PaginatedResponseInterceptor().intercept(
        instance(mockExecution),
        instance(mockHandler),
      );

      result.subscribe((value) => {
        expect(value).toEqual(
          expect.objectContaining({
            skippedRecords: expect.toEqualAnyOf([
              expect.any(Number),
              undefined,
            ]),
            totalRecords: expect.toEqualAnyOf([expect.any(Number), undefined]),
            records: expect.toEqualAnyOf([
              expect.arrayContaining(Array(10).fill('foo')),
              undefined,
            ]),
            payloadSize: expect.toEqualAnyOf([expect.any(Number), undefined]),
            hasNext: expect.toEqualAnyOf([expect.any(Boolean), undefined]),
          }),
        );
      });

      done();
    },
  );
});
