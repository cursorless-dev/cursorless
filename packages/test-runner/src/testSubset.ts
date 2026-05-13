import * as fs from "node:fs";
import * as path from "node:path";
import { getCursorlessRepoRoot } from "@cursorless/lib-node-common";

/**
 * Returns the grep string to pass to Mocha when running a subset of tests.
 * @returns the grep string to pass to Mocha when running a subset of tests,
 * or `undefined` if we are not running a subset of tests.
 */
export function testSubsetGrepString(): string | undefined {
  if (!runTestSubset()) {
    return undefined;
  }
  return fs
    .readFileSync(testSubsetFilePath(), "utf8")
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    .join("|");
}

/**
 * Returns the path of the test subset file.
 * @returns the path of the test subset file
 */
export function testSubsetFilePath() {
  return path.join(
    getCursorlessRepoRoot(),
    "packages",
    "test-runner",
    "testSubsetGrep.properties",
  );
}

function testFailedFilePath() {
  return path.join(
    getCursorlessRepoRoot(),
    "packages",
    "test-runner",
    "failedTests.properties",
  );
}

export function logFailedTests(testNames: string[]) {
  const lines = [`${testNames.length} failed tests`, "", ...testNames];
  fs.writeFileSync(testFailedFilePath(), lines.join("\n"));
}

/**
 * Determine whether we should run just the subset of the tests specified by
 * {@link TEST_SUBSET_GREP_STRING}.
 * @returns `true` if we are using the run test subset launch config
 */
function runTestSubset() {
  // oxlint-disable-next-line node/no-process-env
  return process.env.CURSORLESS_RUN_TEST_SUBSET === "true";
}

/**
 * Determine whether we should log the failed tests to a file. This makes it easier to put them in `testSubsetGrep.properties` for faster iterating.
 * @returns `true` if we should log failed tests to `packages/test-runner/failedTests.properties`
 */
export function shouldLogFailedTests() {
  // oxlint-disable-next-line node/no-process-env
  return process.env.CURSORLESS_LOG_FAILED === "true";
}
