// Ensures that the aliases such as @cursorless/common that we define in
// package.json are active

import { getCursorlessRepoRoot } from "@cursorless/common";
import * as path from "path";
import { runTestsInDir } from "../util/runAllTestsInDir";

/**
 * Runs all Talon tests.
 */
(async () => {
  await runTestsInDir(path.join(getCursorlessRepoRoot(), "packages"), (files) =>
    files.filter((f) => f.endsWith("talon.test.js")),
  );
})();
