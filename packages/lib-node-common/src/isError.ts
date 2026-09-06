/**
 * A user-defined type guard function that checks if a given error is a
 * `NodeJS.ErrnoException`.
 *
 * @param {unknown} error - error to check.
 * @returns {error is NodeJS.ErrnoException} - Returns `true` if the error is a
 * {@link NodeJS.ErrnoException}, otherwise `false`.
 */
export function isErrnoException(
  error: unknown,
): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

export function isEnoentError(error: unknown): error is NodeJS.ErrnoException {
  return isErrnoException(error) && error.code === "ENOENT";
}

export function isEexistError(error: unknown): error is NodeJS.ErrnoException {
  return isErrnoException(error) && error.code === "EEXIST";
}
