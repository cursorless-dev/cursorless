export function checkNonNull<T>(
  value: T | null | undefined,
  errorMessage: () => Error): T {
  if (value == null) {
    throw errorMessage();
  }

  return value;
}
