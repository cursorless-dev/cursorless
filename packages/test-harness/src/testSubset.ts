import * as fs from "fs";
import * as path from "path";
import { getCursorlessRepoRoot } from "@cursorless/common";

/**
 * Returns the grep string to pass to Mocha when running a subset of tests.
 * @returns the grep string to pass to Mocha:
 */
export function testSubsetGrepString(): string {
  const inFile = testSubsetFilePath();
  let grepStr = fs
    .readFileSync(inFile, "utf-8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    .join("|");
  if (process.platform === "win32") {
    // Path separators are OS specific ("/" for Linux/MacOS and "\\" for Windows).
    grepStr = grepStr.replaceAll("/", "\\\\");
  }
  return grepStr;
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

/**
 * Determine whether we should run just the subset of the tests specified by
 * {@link TEST_SUBSET_GREP_STRING}.
 * @returns `true` if we are using the run test subset launch config
 */
export function runTestSubset() {
  return process.env.CURSORLESS_RUN_TEST_SUBSET === "true";
}
