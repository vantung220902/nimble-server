import { ResponseInterceptor } from '@common/interceptors';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { from } from 'rxjs';
import { instance, mock, when } from 'ts-mockito';

describe('ResponseInterceptor', () => {
  test.each([
    [{ text: 'Nimble' }],
    ['string'],
    [123],
    [['item 1', 'item 2']],
    [undefined],
    [null],
    [new Error('error message')],
  ] as any[])(
    'should transform %p to { success, code, data, timestamp}',
    (data, done: any) => {
      const observable = from([data]);

      const mockContext = mock<ExecutionContext>();
      const mockCallHandler = mock<CallHandler>();
      when(mockCallHandler.handle()).thenReturn(observable);

      const result = new ResponseInterceptor().intercept(
        instance(mockContext),
        instance(mockCallHandler),
      );

      result.subscribe((value) => {
        expect(value).toEqual(
          expect.objectContaining({
            success: true,
            code: 200,
            data,
          }),
        );
        expect(value.timestamp).toBeGreaterThan(0);
        done();
      });
    },
  );
});
