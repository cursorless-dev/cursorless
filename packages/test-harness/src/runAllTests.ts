import { getCursorlessRepoRoot } from "@cursorless/node-common";
import { glob } from "glob";
import Mocha from "mocha";
import * as path from "node:path";
import {
  logFailedTests,
  runTestSubset,
  shouldLogFailedTests,
  testSubsetGrepString,
} from "./testSubset";

/**
 * Type of test to run, eg unit, vscode, talon
 */
export enum TestType {
  /** Unit tests can be run without VSCode or Talon or Neovim */
  unit,

  /** VSCode tests must be run from VSCode context */
  vscode,

  /** Talon tests require a running Talon instance */
  talon,

  /** Talon everywhere/JS tests can be run without VSCode or Talon */
  talonJs,

  /** Neovim tests must be run from Neovim context */
  neovim,
}

export function runAllTests(...types: TestType[]): Promise<void> {
  return runTestsInDir(
    path.join(getCursorlessRepoRoot(), "packages"),
    (files) =>
      files.filter((f) => {
        if (f.endsWith("neovim.test.cjs")) {
          return types.includes(TestType.neovim);
        }

        if (f.endsWith("vscode.test.cjs")) {
          return types.includes(TestType.vscode);
        }

        if (f.endsWith("talon.test.cjs")) {
          return types.includes(TestType.talon);
        }

        if (f.endsWith("talonjs.test.cjs")) {
          return types.includes(TestType.talonJs);
        }

        return types.includes(TestType.unit);
      }),
  );
}

async function runTestsInDir(
  testRoot: string,
  filterFiles: (files: string[]) => string[],
): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: "tdd",
    color: true,
    grep: runTestSubset() ? testSubsetGrepString() : undefined, // Only run a subset of tests
  });

  const files = filterFiles(await glob("**/**.test.cjs", { cwd: testRoot }));

  // Add files to the test suite
  files.forEach((f) => mocha.addFile(path.resolve(testRoot, f)));

  console.log(`Running tests in ${testRoot} for ${files.length} files`);
  console.log(JSON.stringify(process.argv, null, 2));
  console.log(JSON.stringify(process.execArgv, null, 2));
  console.log("NODE_OPTIONS:", process.env.NODE_OPTIONS);

  try {
    // Run the mocha test
    await new Promise<void>((resolve, reject) => {
      const failedTests: string[] = [];

      const runner = mocha.run((failures) => {
        if (shouldLogFailedTests()) {
          logFailedTests(failedTests);
        }

        if (failures > 0) {
          reject(`${failures} tests failed.`);
        } else {
          resolve();
        }
      });

      if (shouldLogFailedTests()) {
        runner.on("fail", (test) => failedTests.push(test.fullTitle()));
      }
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
}
