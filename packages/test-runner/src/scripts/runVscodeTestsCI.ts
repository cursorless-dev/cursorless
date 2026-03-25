/**
 * This file can be run from node to run vscode tests in CI
 */

import * as path from "node:path";
import { getCursorlessRepoRoot } from "@cursorless/lib-node-common";
import { launchVscodeAndRunTests } from "../launchVscodeAndRunTests";

const extensionTestsPath = path.resolve(
  getCursorlessRepoRoot(),
  "packages/test-runner/out/extensionTestsVscode.cjs",
);

void launchVscodeAndRunTests(extensionTestsPath);
