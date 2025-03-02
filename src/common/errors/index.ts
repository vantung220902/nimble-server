const toError = (candidate: unknown): Error => {
  try {
    return new Error(JSON.stringify(candidate));
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(candidate));
  }
};

export const getStack = (err: Error) =>
  err && err.stack ? err.stack.split('\n').map((s) => s.trim()) : [];

export const isError = (maybeError: any): maybeError is Error =>
  maybeError && instanceOfError(maybeError);

export const instanceOfError = (maybeError: unknown): boolean =>
  maybeError instanceof Error;

export const getError = (maybeError: unknown): Error =>
  isError(maybeError) || instanceOfError(maybeError)
    ? (maybeError as Error)
    : toError(maybeError);
