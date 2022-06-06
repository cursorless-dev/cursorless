import * as glob from "glob";
import * as Mocha from "mocha";
import * as path from "path";
import { runTestSubset, TEST_SUBSET_GREP_STRING } from "./runTestSubset";

export function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: "tdd",
    color: true,
    grep: runTestSubset() ? TEST_SUBSET_GREP_STRING : undefined, // Only run a subset of tests
  });

  const testsRoot = path.resolve(__dirname, "..");

  return new Promise((c, e) => {
    glob("**/**.test.js", { cwd: testsRoot }, (err, files) => {
      if (err) {
        return e(err);
      }

      // Add files to the test suite
      files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));

      try {
        // Run the mocha test
        mocha.run((failures) => {
          if (failures > 0) {
            e(new Error(`${failures} tests failed.`));
          } else {
            c();
          }
        });
      } catch (err) {
        console.error(err);
        e(err);
      }
    });
  });
}
