/**
 * This file can be run from node to run neovim tests in CI
 */

import { launchNeovimAndRunTests } from "../launchNeovimAndRunTests";

process.env.CURSORLESS_MODE = "test";

void (async () => {
  await launchNeovimAndRunTests();
})();
