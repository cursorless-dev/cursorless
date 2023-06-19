import * as globRaw from "glob";
import * as Mocha from "mocha";
import * as path from "path";
import { runTestSubset, TEST_SUBSET_GREP_STRING } from "@cursorless/common";
import { promisify } from "util";

const glob = promisify(globRaw);

export function runAllTestsInDir(
  testRoot: string,
  includeVscodeTests: boolean,
) {
  return runAllTestsInDirs([testRoot], includeVscodeTests);
}

export async function runAllTestsInDirs(
  testRoots: string[],
  includeVscodeTests: boolean,
): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: "tdd",
    color: true,
    grep: runTestSubset() ? TEST_SUBSET_GREP_STRING : undefined, // Only run a subset of tests
  });

  for (const testRoot of testRoots) {
    let files = await glob("**/**.test.js", { cwd: testRoot });

    if (!includeVscodeTests) {
      files = files.filter((f) => !f.endsWith("vscode.test.js"));
    }

    // Add files to the test suite
    files.forEach((f) => mocha.addFile(path.resolve(testRoot, f)));
  }

  try {
    // Run the mocha test
    await new Promise<void>((c, e) => {
      mocha.run((failures) => {
        if (failures > 0) {
          e(new Error(`${failures} tests failed.`));
        } else {
          c();
        }
      });
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
}
