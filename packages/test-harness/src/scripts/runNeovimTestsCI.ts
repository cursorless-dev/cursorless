/**
 * This file can be run from node to run neovim tests in CI
 */

import { launchNeovimAndRunTests } from "../launchNeovimAndRunTests";

void (async () => {
  process.env.CURSORLESS_MODE = "test";

  await launchNeovimAndRunTests();
})();
