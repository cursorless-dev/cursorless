// Ensures that the aliases such as @cursorless/common that we define in
// package.json are active

import { getCursorlessRepoRoot } from "@cursorless/common";
import * as path from "path";
import { runAllTestsInDir } from "../util/runAllTestsInDir";

/**
 * Runs all tests that don't have to be run within VSCode.
 * @returns A promise that resolves when tests have finished running
 */
export function run(): Promise<void> {
  return runAllTestsInDir(
    path.join(getCursorlessRepoRoot(), "packages"),
    false,
  );
}
