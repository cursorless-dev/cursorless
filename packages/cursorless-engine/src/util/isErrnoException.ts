/**
 * A user-defined type guard function that checks if a given error is a
 * `NodeJS.ErrnoException`.
 *
 * @param {any} error - The error to check.
 * @returns {error is NodeJS.ErrnoException} - Returns `true` if the error is a
 * {@link NodeJS.ErrnoException}, otherwise `false`.
 */
export function isErrnoException(error: any): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
