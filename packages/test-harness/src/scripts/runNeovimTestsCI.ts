/**
 * This file can be run from node to run neovim tests in CI
 */

import { launchNeovimAndRunTests } from "../launchNeovimAndRunTests";

(async () => {
  // Note that we run all extension tests, including unit tests, in neovim, even though
  // unit tests could be run separately.
  await launchNeovimAndRunTests();
})();
