/**
 * Add the file path ending of a recorded test and ONLY that one will run
 * when using the "Run Single Extension Test" launch configuration.
 */

const filenameEnd = "actions/postVest.yml";

export function runSingleTest() {
  return process.env.CURSORLESS_RUN_SINGLE_TEST === "true";
}

export function getSingleTestFilename(): string {
  return filenameEnd;
}
