/**
 * This file can be run from node to run vscode tests in CI
 */

import { getCursorlessRepoRoot } from "@cursorless/node-common";
import * as path from "node:path";
import { launchVscodeAndRunTests } from "../launchVscodeAndRunTests";

void (async () => {
  // Note that we run all extension tests, including unit tests, in VSCode, even though
  // unit tests could be run separately.
  const extensionTestsPath = path.resolve(
    getCursorlessRepoRoot(),
    "packages/test-harness/dist/extensionTestsVscode.cjs",
  );

  try {
    await launchVscodeAndRunTests(extensionTestsPath);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log("Error running launchVscodeAndRunTests tests:");
    console.log(error);
    console.error(errorMessage);
  }
})();
