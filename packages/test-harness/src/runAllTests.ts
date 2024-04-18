import Mocha from "mocha";
import * as path from "path";
import { getCursorlessRepoRoot } from "@cursorless/common";
import { runTestSubset, testSubsetGrepString } from "./testSubset";
import { glob } from "glob";

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

  /** Neovim tests must be run from Neovim context */
  neovim,
}

export function runAllTests(...types: TestType[]) {
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
    // rootHooks: {
    //   beforeAll(){
    //     this.neovimClient = ...
    //   }
    // }
  });

  const files = filterFiles(await glob("**/**.test.cjs", { cwd: testRoot }));

  // Add files to the test suite
  files.forEach((f) => mocha.addFile(path.resolve(testRoot, f)));

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
