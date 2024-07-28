import { TestType, runAllTests } from "../runAllTests";

import type { NeovimClient, NvimPlugin } from "neovim";

/**
 * Runs all extension tests.  This function should only be called after attaching to the
 * "node" process, such as when testing cursorless in neovim.
 * We use this runner for both the local test launch config
 * and the CI test runner action.
 * @returns A promise that resolves when tests have finished running
 */
export async function run(plugin: NvimPlugin): Promise<void> {
  /**
   * We need to pass the neovim client to the tests that are executed through mocha,
   * so we add it to the global object.
   */
  const client = plugin.nvim as NeovimClient;
  (global as any).additionalParameters = {
    client: client,
  };
  let code = 0;
  // NOTE: the parsing of the logs below is only done on CI in order to detect success/failure
  try {
    await runAllTests(TestType.neovim, TestType.unit);
    console.log(`==== TESTS FINISHED: code: ${code}`);
  } catch (error) {
    console.log(`==== TESTS ERROR:`);
    console.error(error);
    code = 1;
    console.log(`==== TESTS FINISHED: code: ${code}`);
  }
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
