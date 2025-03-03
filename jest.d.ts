export {};

declare global {
  namespace jest {
    interface Expect {
      toEqualAnyOf(argument: any[]);
    }
    interface Matchers<R> {
      toEqualAnyOf(argument: any[]): R;
    }
  }
}
