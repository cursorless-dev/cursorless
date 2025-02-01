import * as fs from "node:fs";
import * as path from "node:path";
import { getCursorlessRepoRoot } from "@cursorless/node-common";

/**
 * Returns the grep string to pass to Mocha when running a subset of tests.
 * @returns the grep string to pass to Mocha:
 */
export function testSubsetGrepString(): string {
  const inFile = testSubsetFilePath();
  return fs
    .readFileSync(inFile, "utf-8")
    .split(/\r?\n/)
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
    "test-harness",
    "testSubsetGrep.properties",
  );
}

function testFailedFilePath() {
  return path.join(
    getCursorlessRepoRoot(),
    "packages",
    "test-harness",
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
export function runTestSubset() {
  return process.env.CURSORLESS_RUN_TEST_SUBSET === "true";
}

/**
 * Determine whether we should log the failed tests.
 * @returns `true` if we should log the failed tests
 */
export function shouldLogFailedTests() {
  return process.env.CURSORLESS_LOG_FAILED === "true";
}
