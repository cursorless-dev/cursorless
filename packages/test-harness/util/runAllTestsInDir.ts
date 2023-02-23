import * as globRaw from "glob";
import * as Mocha from "mocha";
import * as path from "path";
import { runTestSubset, TEST_SUBSET_GREP_STRING } from "@cursorless/common";
import { promisify } from "util";

const glob = promisify(globRaw);

export function runAllTestsInDir(testRoot: string) {
  return runAllTestsInDirs([testRoot]);
}

export async function runAllTestsInDirs(testRoots: string[]): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: "tdd",
    color: true,
    grep: runTestSubset() ? TEST_SUBSET_GREP_STRING : undefined, // Only run a subset of tests
  });

  for (const testRoot of testRoots) {
    const files = await glob("**/**.test.js", { cwd: testRoot });

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
