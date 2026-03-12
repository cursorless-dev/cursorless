/**
 * This file can be run from node to run vscode tests in CI
 */

import { getCursorlessRepoRoot } from "@cursorless/node-common";
import * as path from "node:path";
import { launchVscodeAndRunTests } from "../launchVscodeAndRunTests";

void (async () => {
  process.env.CURSORLESS_MODE = "test";

  const extensionTestsPath = path.resolve(
    getCursorlessRepoRoot(),
    "packages/test-harness/dist/extensionTestsVscode.cjs",
  );

  await launchVscodeAndRunTests(extensionTestsPath);
})();
