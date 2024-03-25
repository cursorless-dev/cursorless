import * as child from "child_process";
import * as fs from "fs";
import { testSubsetFilePath } from "../testSubset";

const TEMPLATE = `# This file contains the grep strings to pass to Mocha when running a subset of tests.
# These grep strings will be used with the "Run test subset" launch configuration.
# See https://mochajs.org/#-grep-regexp-g-regexp for supported syntax.
#
# One regular expression per line.
# Tests matching any of the regular expressions will be run.

snippets
languages/go/
`;

/**
 * Generates the testSubsetGrep.properties file if it doesn't exist. If the
 * --fail-if-not-exists flag is passed, the script will fail if the file doesn't
 * exist.
 */
function run() {
  const testSubsetGrepPath = testSubsetFilePath();

  const exists = fs.existsSync(testSubsetGrepPath);

  if (!exists) {
    fs.writeFileSync(testSubsetGrepPath, TEMPLATE);
  }

  if (!exists || process.argv.includes("--always-open")) {
    child.execSync(`code ${testSubsetGrepPath}`);
  }

  if (!exists && process.argv.includes("--fail-if-not-exists")) {
    console.warn(`Please edit ${testSubsetGrepPath} and re-run.`);
    process.exit(1);
  }
}

run();
