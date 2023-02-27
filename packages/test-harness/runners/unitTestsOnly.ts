// Ensures that the aliases such as @cursorless/common that we define in
// package.json are active

import * as path from "path";
import { runAllTestsInDirs } from "../util/runAllTestsInDir";

const testDirectories = ["cursorless-engine", "common"];

export function run(): Promise<void> {
  return runAllTestsInDirs(
    testDirectories.map((testDirectory) =>
      path.resolve(__dirname, `../../${testDirectory}`),
    ),
  );
}
