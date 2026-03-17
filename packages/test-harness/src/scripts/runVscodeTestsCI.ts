/**
 * This file can be run from node to run vscode tests in CI
 */

import { getCursorlessRepoRoot } from "@cursorless/node-common";
import * as path from "node:path";
import { launchVscodeAndRunTests } from "../launchVscodeAndRunTests";

process.env.CURSORLESS_MODE = "test";

void (async () => {
  const extensionTestsPath = path.resolve(
    getCursorlessRepoRoot(),
    "packages/test-harness/out/extensionTestsVscode.cjs",
  );

  await launchVscodeAndRunTests(extensionTestsPath);
})();
