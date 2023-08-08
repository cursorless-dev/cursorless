import * as child from "child_process";
import * as fs from "fs";
import * as path from "path";

const template = `# This file contains the grep strings to pass to Mocha when running a subset of tests.
# These grep strings will be used with the "Run test subset" launch configuration.
# See https://mochajs.org/#-grep-regexp-g-regexp for supported syntax.
#
# One regular expression per line.
# Tests matching any of the regular expressions will be run.

snippets
languages/go/
`;

function run() {
  // Two possible modes:
  //   * user explicitly asked us to open; create as needed, always open
  //   * run as a side effect of "test subset"; create as needed, and open and fail if so
  const testUtilPath = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "..",
    "..",
    "packages",
    "common",
    "src",
    "testUtil",
  );
  const testSubsetGrepPath = path.join(
    testUtilPath,
    "testSubsetGrep.properties",
  );
  const exists = fs.existsSync(testSubsetGrepPath);
  if (!exists) {
    fs.writeFileSync(testSubsetGrepPath, template);
  }
  const explicit = process.argv.includes("--open");
  if (explicit || !exists) {
    child.exec(`code ${testSubsetGrepPath}`);
  }
  if (!explicit && !exists) {
    console.log("Please edit testSubsetGrep.properties and re-run.");
    process.exit(1);
  }
}

run();
