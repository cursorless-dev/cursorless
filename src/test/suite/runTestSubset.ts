/**
 * The grep string to pass to Mocha when running a subset of tests. This grep
 * string will be used with the "Run Single Extension Test" launch
 * configuration.
 * See https://mochajs.org/#-grep-regexp-g-regexp for supported syntax
 */
export const TEST_SUBSET_GREP_STRING = "actions/insertEmptyLines";

/**
 * Determine whether we should run just the subset of the tests specified by
 * {@link TEST_SUBSET_GREP_STRING}.
 * @returns `true` if we are using the run test subset launch config
 */
export function runTestSubset() {
  return process.env.CURSORLESS_RUN_TEST_SUBSET === "true";
}
