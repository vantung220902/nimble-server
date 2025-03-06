import 'jsdom';

declare module 'jsdom' {
  interface Window {
    ['Infinity']: number;
  }
}
