/**
 * This file can be run from node to run vscode tests in CI
 */

import { getCursorlessRepoRoot } from "@cursorless/lib-node-common";
import * as path from "node:path";
import { launchVscodeAndRunTests } from "../launchVscodeAndRunTests";

const extensionTestsPath = path.resolve(
  getCursorlessRepoRoot(),
  "packages/test-harness/out/extensionTestsVscode.cjs",
);

void launchVscodeAndRunTests(extensionTestsPath);
