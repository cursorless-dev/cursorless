import type { NvimPlugin } from "neovim";
import { activate } from "./extension";

/**
 * Extension entrypoint called by node-client on Neovim startup.
 * - Register the functions that are exposed to Neovim.
 *   Note that these function need to start with a capital letter to be callable from Neovim.
 */
export default function entry(plugin: NvimPlugin) {
  // We make sure the cursorless-neovim extension is only loaded once,
  // as otherwise we will run our first copy when loading the extension
  // and a different new copy for executing other functions
  // At the moment, it doesn't matter that much because we don't call other functions
  // That being said it doesn't hurt to set it to "false" anyway
  // NOTE: this is the case because all the files are rolled up into a single index.cjs file
  // and node-client would reload that index.cjs file if "dev" was set to "true"
  plugin.setOptions({ dev: false });

  plugin.registerFunction(
    "CursorlessLoadExtension",
    async () => await loadExtension(plugin),
    { sync: false },
  );
}

/**
 * Load the cursorless engine.
 */
async function loadExtension(plugin: NvimPlugin) {
  console.log(
    "===============================================================================================",
  );
  console.log("loadExtension(cursorless-neovim): start");
  await activate(plugin);
  console.log("loadExtension(cursorless-neovim): done");
}
