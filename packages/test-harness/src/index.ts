import { TestType, runAllTests } from "./runAllTests";

import { NvimPlugin } from "neovim";

/**
 * Runs all extension tests.  This function should only be called after attaching to the
 * "node" process, such as when testing cursorless in neovim.
 * We use this runner for both the local test launch config
 * and the CI test runner action.
 * @returns A promise that resolves when tests have finished running
 */
// FIXME: this is neovim specific atm so in the future we can support other apps here
// with an environment variable
export function run(): Promise<void> {
  // return runAllTests(TestType.neovim, TestType.unit); //TODO: use this line at the end
  return runAllTests(TestType.neovim); //TODO: this allows running our test only for now
}

/**
 * Extension entrypoint called by node-client on Neovim startup.
 * - Register the functions that are exposed to Neovim.
 *   Note that these function need to start with a capital letter to be callable from Neovim.
 */
export default function entry(plugin: NvimPlugin) {
  // Set your plugin to dev mode, which will cause the module to be reloaded on each invocation
  // though it does not seem useful in practice for neovim as we can't really call CursorlessLoadExtension() again without restarting Neovim?
  // plugin.setOptions({ dev: true });
  plugin.setOptions({ dev: false });
  // plugin.setOptions({ dev: false, alwaysInit: false });

  plugin.registerFunction("TestHarnessRun", async () => await run(), {
    sync: false,
  });
}
