import * as path from "node:path";
import fastGlob from "fast-glob";
import Mocha from "mocha";
import { getCursorlessRepoRoot } from "@cursorless/lib-node-common";
import {
  logFailedTests,
  shouldLogFailedTests,
  testSubsetGrepString,
} from "./testSubset";

/**
 * Type of test to run, eg unit, vscode, talon
 */
export enum TestType {
  /** Unit tests can be run without VSCode or Talon or Neovim */
  unit = "test",

  /** VSCode tests must be run from VSCode context */
  vscode = "vscode.test",

  /** Talon tests require a running Talon instance */
  talon = "talon.test",

  /** Talon-JS tests can be run without VSCode or Talon */
  talonJs = "talonjs.test",

  /** Neovim tests must be run from Neovim context */
  neovim = "neovim.test",
}

export function runAllTests(type: TestType): Promise<void> {
  parseArgumentsAndUpdateEnv();

  const testRoot = path.join(getCursorlessRepoRoot(), "packages");

  let filePattern: string;
  let ignore: string[] = [];

  switch (type) {
    case TestType.unit:
      filePattern = "test.ts";
      ignore = [
        TestType.vscode,
        TestType.talon,
        TestType.talonJs,
        TestType.neovim,
      ].map((t) => `**/*.${t}.ts`);
      break;

    case TestType.talon:
    case TestType.talonJs:
      filePattern = `${type}.ts`;
      break;

    // These tests have to be .cjs files because they import vscode and neovim modules which don't work with ts files
    case TestType.vscode:
    case TestType.neovim:
      filePattern = `${type}.cjs`;
      break;
    default: {
      const exhaustiveCheck: never = type;
      throw new Error(`Unhandled test type: ${exhaustiveCheck}`);
    }
  }

  return runTestsInDir(testRoot, filePattern, ignore);
}

async function runTestsInDir(
  testRoot: string,
  filePattern: string,
  ignore: string[],
): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: "tdd",
    color: true,
    grep: testSubsetGrepString(),
  });

  const files = await fastGlob(`**/*.${filePattern}`, {
    cwd: testRoot,
    followSymbolicLinks: false,
    absolute: true,
    ignore: ["**/node_modules/**", ...ignore],
  });

  if (files.length === 0) {
    throw new Error(
      `No test files found. Do you need to run "pnpm run build" first?`,
    );
  }

  // Add files to the test suite
  for (const file of files) {
    mocha.addFile(file);
  }

  // Run the mocha test
  await new Promise<void>((resolve, reject) => {
    const failedTests: string[] = [];

    const runner = mocha.run((failures) => {
      if (shouldLogFailedTests()) {
        logFailedTests(failedTests);
      }

      if (failures > 0) {
        reject(new Error(`${failures} tests failed.`));
      } else {
        resolve();
      }
    });

    if (shouldLogFailedTests()) {
      runner.on("fail", (test) => failedTests.push(test.fullTitle()));
    }
  });
}

function parseArgumentsAndUpdateEnv() {
  const args = new Set(process.argv.slice(2));

  // oxlint-disable-next-line node/no-process-env
  process.env.CURSORLESS_MODE = "test";

  if (args.has("--subset")) {
    // oxlint-disable-next-line node/no-process-env
    process.env.CURSORLESS_RUN_TEST_SUBSET = "true";
  }

  if (args.has("--update")) {
    // oxlint-disable-next-line node/no-process-env
    process.env.CURSORLESS_TEST_UPDATE_FIXTURES = "true";
  }
}
