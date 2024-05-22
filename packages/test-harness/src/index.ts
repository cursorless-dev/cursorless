import { TestType, runAllTests } from "./runAllTests";

import type { NeovimClient, NvimPlugin } from "neovim";

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
  // https://github.com/mochajs/mocha/issues/3780#issuecomment-583064196
  // https://stackoverflow.com/questions/69427050/how-to-extend-globalthis-global-type
  const client = plugin.nvim as NeovimClient;
  (global as any).additionalParameters = {
    client: client,
  };
  let code = 0;
  try {
    await runAllTests(TestType.neovim, TestType.unit);
    console.log(`==== TESTS FINISHED: code: ${code}`);
    // console.log(`index.ts: killing neovim with q!`);
    // await client.command(":q!");
  } catch (error) {
    console.log(`==== TESTS ERROR:`);
    console.error(error);
    code = 1;
    console.log(`==== TESTS FINISHED: code: ${code}`);
    // https://stackoverflow.com/questions/11828270/how-do-i-exit-vim
    // console.log(`index.ts: killing neovim with cq!`);
    // await client.command(":cq!");
  }
  // XXX: launchNeovimAndRunTests.ts will catch neovim exit code on CI

  // console.log(`index.ts: killing neovim with code ${code}`);
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
