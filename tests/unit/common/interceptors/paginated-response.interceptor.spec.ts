import { PaginatedResponseInterceptor } from '@common/interceptors';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { from } from 'rxjs';
import { instance, mock, when } from 'ts-mockito';

expect.extend({
  toEqualAnyOf(received: any, argument: any[]) {
    const found = argument.some((eqItem) => {
      if (typeof eqItem === 'undefined' && typeof received === 'undefined') {
        return true;
      }
      if (eqItem === null && received === null) {
        return true;
      }
      try {
        expect(received).toEqual(eqItem);
        return true;
      } catch (e) {
        return false;
      }
    });
    return found
      ? {
          message: () => 'Ok',
          pass: true,
        }
      : {
          message: () => `expected ${received} to be any of ${argument}`,
          pass: false,
        };
  },
});

describe('PaginatedResponseInterceptor', () => {
  test.each([
    [{ text: 'Nimble' }],
    ['string'],
    [123],
    [['item 1', 'item 2']],
    [undefined],
    [null],
    [new Error('error message')],
    [
      {
        skippedRecords: 100,
        totalRecords: 1000,
        records: [],
        payloadSize: 100,
        hasNext: true,
      },
    ],
  ] as any[])(
    'should transform %p to { skippedRecords, totalRecords, records, payloadSize, hasNext }',
    (record, done: any) => {
      const observable = from([record]);

      const mockExecution = mock<ExecutionContext>();
      const mockCallHandler = mock<CallHandler>();
      when(mockCallHandler.handle()).thenReturn(observable);

      const result = new PaginatedResponseInterceptor().intercept(
        instance(mockExecution),
        instance(mockCallHandler),
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
              expect.arrayContaining([]),
              undefined,
            ]),
            payloadSize: expect.toEqualAnyOf([expect.any(Number), undefined]),
            hasNext: expect.toEqualAnyOf([expect.any(Boolean), undefined]),
          }),
        );

        done();
      });
    },
  );
});
