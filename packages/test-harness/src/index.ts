import { TestType, runAllTests } from "./runAllTests";

import type { NeovimClient, NvimPlugin } from "neovim";

// https://stackoverflow.com/questions/37764665/how-to-implement-sleep-function-in-typescript
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Runs all extension tests.  This function should only be called after attaching to the
 * "node" process, such as when testing cursorless in neovim.
 * We use this runner for both the local test launch config
 * and the CI test runner action.
 * @returns A promise that resolves when tests have finished running
 */
// FIXME: this is neovim specific atm so in the future we can support other apps here
// with an environment variable
export async function run(plugin: NvimPlugin): Promise<void> {
  console.log("CED: run()");
  await delay(10000);
  console.log("CED: run() after sleep");

  // https://github.com/mochajs/mocha/issues/3780#issuecomment-583064196
  // https://stackoverflow.com/questions/69427050/how-to-extend-globalthis-global-type
  (global as any).additionalParameters = {
    client: plugin.nvim as NeovimClient,
  };
  try {
    //await runAllTests(TestType.neovim, TestType.unit);
    await runAllTests(TestType.neovim);
  } catch (error) {
    console.error("CED: runAllTests failed (1)");
    console.error(error);
    // https://stackoverflow.com/questions/11828270/how-do-i-exit-vim
    // XXX: kill neovim with -1 code ":cq!" command?
    return;
  }
  console.log("CED: runAllTests succeeded (1)");
  // XXX: kill neovim with 0 code ":q!" command?

  // XXX: launchNeovimAndRunTests.ts will catch that error code
}

/**
 * Extension entrypoint called by node-client on Neovim startup.
 * - Register the functions that are exposed to Neovim.
 *   Note that these function need to start with a capital letter to be callable from Neovim.
 */
export default function entry(plugin: NvimPlugin) {
  plugin.registerFunction("TestHarnessRun", () => run(plugin), {
    sync: false,
  });
}
