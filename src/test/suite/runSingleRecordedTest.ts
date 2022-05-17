/**
 * Add the file path ending of a recorded test and ONLY that one will run
 */

// example:
// const filenameEnd = "textual/takePairRound.yml";

const filenameEnd = "";

export function runSingleTest() {
  return !!filenameEnd;
}

export function getSingleTestFilename(): string {
  return filenameEnd;
}
