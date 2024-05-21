/**
 * This file can be run from node to run neovim tests in CI
 */

// import { getCursorlessRepoRoot } from "@cursorless/common";
// import * as path from "path";
import { launchNeovimAndRunTests } from "../launchNeovimAndRunTests";

(async () => {
  // Note that we run all extension tests, including unit tests, in neovim, even though
  // unit tests could be run separately.
  // const extensionTestsPath = path.resolve(
  //   getCursorlessRepoRoot(),
  //   // "packages/test-harness/dist/extensionTestsNeovim.cjs",
  //   "packages/test-harness/out/index.cjs",
  // );

  await launchNeovimAndRunTests(/*extensionTestsPath*/);
})();
