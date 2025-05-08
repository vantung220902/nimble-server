import { ResponseInterceptor } from '@common/interceptors';
import { CallHandler, ExecutionContext, HttpStatus } from '@nestjs/common';
import { from } from 'rxjs';
import { instance, mock, when } from 'ts-mockito';

describe('ResponseInterceptor', () => {
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
  ]);

  testCases(
    'should transform %p to { success, code, data, timestamp}',
    (data, done: jest.DoneCallback) => {
      const observable = from([data]);

      when(mockHandler.handle()).thenReturn(observable);

      const response = new ResponseInterceptor().intercept(
        instance(mockExecution),
        instance(mockHandler),
      );

      response.subscribe((value) => {
        expect(value).toEqual(
          expect.objectContaining({
            success: true,
            code: HttpStatus.OK,
            data,
          }),
        );
        expect(value.timestamp).toBeGreaterThan(0);
      });

      done();
    },
  );
});
