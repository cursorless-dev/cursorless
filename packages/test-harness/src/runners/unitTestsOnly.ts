// Ensures that the aliases such as @cursorless/common that we define in
// package.json are active

import { getCursorlessRepoRoot } from "@cursorless/common";
import * as path from "path";
import { runAllTestsInDirs } from "../util/runAllTestsInDir";

const testDirectories = ["cursorless-engine", "common"];

export function run(): Promise<void> {
  return runAllTestsInDirs(
    testDirectories.map((testDirectory) =>
      path.resolve(getCursorlessRepoRoot(), `packages/${testDirectory}`),
    ),
  );
}
