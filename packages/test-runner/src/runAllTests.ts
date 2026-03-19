import { getCursorlessRepoRoot } from "@cursorless/lib-node-common";
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

export function runAllTests(type: TestType): Promise<void> {
  parseArgumentsAndUpdateEnv();

  const testRoot = path.join(getCursorlessRepoRoot(), "packages");

  return runTestsInDir(testRoot, (files) =>
    files.filter((f) => {
      if (f.endsWith("neovim.test.cjs")) {
        return type === TestType.neovim;
      }

      if (f.endsWith("vscode.test.cjs")) {
        return type === TestType.vscode;
      }

      if (f.endsWith("talon.test.cjs")) {
        return type === TestType.talon;
      }

      if (f.endsWith("talonjs.test.cjs")) {
        return type === TestType.talonJs;
      }

      return type === TestType.unit;
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

  if (files.length === 0) {
    throw new Error(
      `No test files found. Do you need to run "pnpm run build" first?`,
    );
  }

  // Add files to the test suite
  files.forEach((f) => mocha.addFile(path.resolve(testRoot, f)));

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

function parseArgumentsAndUpdateEnv() {
  const args = new Set(process.argv.slice(2));

  process.env.CURSORLESS_MODE = "test";

  if (args.has("--subset")) {
    process.env.CURSORLESS_RUN_TEST_SUBSET = "true";
  }

  if (args.has("--update")) {
    process.env.CURSORLESS_TEST_UPDATE_FIXTURES = "true";
  }
}
