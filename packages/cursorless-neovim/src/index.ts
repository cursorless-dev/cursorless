// import { createCursorlessEngine } from "@cursorless/cursorless-engine";
import { NeovimExtensionContext } from "./ide/neovim/NeovimExtensionContext";
import { NvimPlugin } from "neovim";
import { activate } from "./extension";
import { injectContext } from "./singletons/context.singleton";
import { handleCommandInternal } from "./registerCommands";

/**
 * Extension entrypoint called by node-client on Neovim startup.
 * - Register the functions that are exposed to Neovim.
 *   Note that these function need to start with a capital letter to be callable from Neovim.
 */
export default function entry(plugin: NvimPlugin) {
  // Set your plugin to dev mode, which will cause the module to be reloaded on each invocation
  // TODO: it is not that useful in practice? Can we really call CursorlessLoadExtension() again without restarting Neovim?
  // plugin.setOptions({ dev: false });
  plugin.setOptions({ dev: true });

  plugin.registerFunction(
    "CursorlessLoadExtension",
    () => loadExtension(plugin),
    { sync: false },
  );
}

/**
 * Load the cursorless engine.
 */
function loadExtension(plugin: NvimPlugin) {
  const currentDate: Date = new Date();
  const currentDateStr: string = currentDate.toLocaleString();

  console.warn("loadExtension(cursorless-neovim): " + currentDateStr);
  // plugin.nvim.setLine(currentDateStr);

  const extensionContext = new NeovimExtensionContext(plugin);
  injectContext(extensionContext);
  activate(extensionContext);
}

/**
 * Handle the command received from the command-server Neovim extension
 * NOTE: this is why we export it from the main file
 * @param args something like XXX
 * @returns
 */
export function handleCommand(...args: any): Promise<any> {
  return handleCommandInternal(...args);
}
