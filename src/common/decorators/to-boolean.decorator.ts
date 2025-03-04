import { Transform } from 'class-transformer';

export function ToBoolean(): PropertyDecorator {
  return Transform(({ value }) => {
    if (typeof value === 'string' && value) return value === 'true';
    if (typeof value === 'boolean') return value;
    if (value === null) return null;
    return undefined;
  });
}
