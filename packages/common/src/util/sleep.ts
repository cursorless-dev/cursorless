/**
 * Sleep function that returns a promise that resolves when the sleep is
 * complete.
 *
 * WARNING: Please do not use this function in tests, because we retry our tests
 * on failure, and this function will sleep the same amount of time every time
 * the test is retried.  Prefer {@link sleepWithBackoff} instead.
 */
export default function sleep(timeout: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}
