// import { createCursorlessEngine } from "@cursorless/cursorless-engine";
import { NeovimExtensionContext } from "./ide/neovim/NeovimExtensionContext";
import { NvimPlugin } from "neovim";
import { activate } from "./extension";
import { injectContext } from "./singletons/context.singleton";
import { handleCommandInternal } from "./registerCommands";

/**
 * Extension entrypoint called by node-client on Cursorless startup.
 * - Register the functions that are exposed to neovim.
 *   Note that these function need to start with a capital letter to be callable from neovim.
 */
export default function entry(plugin: NvimPlugin) {
  // Set your plugin to dev mode, which will cause the module to be reloaded on each invocation
  // plugin.setOptions({ dev: false });
  plugin.setOptions({ dev: true });

  plugin.registerFunction("CursorlessLoadNode", () => loadNode(plugin), {
    sync: false,
  });

  plugin.registerFunction(
    "CursorlessLoadExtension",
    () => loadExtension(plugin),
    { sync: false },
  );
}

/**
 * Load node.exe inside nvim.exe.
 * This is useful for debugging purpose so we can attach to node.
 */
function loadNode(plugin: NvimPlugin) {
  const currentDate: Date = new Date();
  const currentDateStr: string = currentDate.toLocaleString();

  console.warn("loadNode(): " + currentDateStr);
  // plugin.nvim.setLine(createCursorlessEngine.toString().split("\n")[0]);
}

/**
 * Load the cursorless engine.
 */
function loadExtension(plugin: NvimPlugin) {
  const currentDate: Date = new Date();
  const currentDateStr: string = currentDate.toLocaleString();

  console.warn("loadExtension(): " + currentDateStr);
  // plugin.nvim.setLine(currentDateStr);

  const extensionContext = new NeovimExtensionContext(plugin);
  injectContext(extensionContext);
  activate(extensionContext);
}

export function handleCommand(...args: any): Promise<any> {
  console.warn(`handleCommand(): args=${args}`);
  return handleCommandInternal(...args);
}
