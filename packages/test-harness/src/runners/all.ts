// Ensures that the aliases such as @cursorless/common that we define in
// package.json are active

import { getCursorlessRepoRoot } from "@cursorless/common";
import * as path from "path";
import { runAllTestsInDir } from "../util/runAllTestsInDir";

/**
 * Runs all tests.  This function should only be called via the
 * --extensionDevelopmentPath VSCode mechanism, as it includes tests that can
 * only run in VSCode
 * @returns A promise that resolves when tests have finished running
 */
export function run(): Promise<void> {
  return runAllTestsInDir(path.join(getCursorlessRepoRoot(), "packages"));
}
