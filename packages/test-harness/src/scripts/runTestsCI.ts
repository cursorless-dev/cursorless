/**
 * This file can be run from node to run tests in CI
 */

import { getCursorlessRepoRoot } from "@cursorless/common";
import * as path from "pathe";
import { launchVscodeAndRunTests } from "../launchVscodeAndRunTests";

(async () => {
  // Note that we run all extension tests, including unit tests, in VSCode, even though
  // unit tests could be run separately.
  const extensionTestsPath = path.resolve(
    getCursorlessRepoRoot(),
    "packages/test-harness/dist/extensionTestsVscode.cjs",
  );

  await launchVscodeAndRunTests(extensionTestsPath);
})();
