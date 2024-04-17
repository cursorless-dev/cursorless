import { NeovimClient, NvimPlugin } from "neovim";
import { activate } from "./extension";
import { handleCommandInternal } from "./registerCommands";
import { runRecordedTestCases } from "./suite/recorded_neovim_test";
import { CursorlessApi } from "./getExtensionApi";
import { getCursorlessApi } from "./singletons/cursorlessapi.singleton";
import { neovimClient } from "./singletons/client.singleton";
import { getNeovimIDE } from "./neovimHelpers";
import { NeovimIDE } from "./ide/neovim/NeovimIDE";
import { commandApi } from "./singletons/cmdapi.singleton";

/**
 * Extension entrypoint called by node-client on Neovim startup.
 * - Register the functions that are exposed to Neovim.
 *   Note that these function need to start with a capital letter to be callable from Neovim.
 */
export default function entry(plugin: NvimPlugin) {
  // We make sure the cursorless-neovim extension is only loaded once,
  // as otherwise we will run our first copy when loading the extension
  // and a different copy for running the testcases
  plugin.setOptions({ dev: false });

  plugin.registerFunction(
    "CursorlessLoadExtension",
    async () => await loadExtension(plugin),
    { sync: false },
  );

  plugin.registerFunction(
    "CursorlessRunRecordedTestCases",
    async () => await runRecordedTestCases(),
    { sync: false },
  );
}

/**
 * Load the cursorless engine.
 */
async function loadExtension(plugin: NvimPlugin) {
  console.warn(
    "===============================================================================================",
  );
  console.warn("loadExtension(cursorless-neovim): start");
  await activate(plugin);
  console.warn("loadExtension(cursorless-neovim): done");
}

/**
 * Handle the command received from the command-server Neovim extension
 * NOTE: this is why we export it from the main file
 * @param args something like XXX
 * @returns
 */
export async function handleCommand(...args: any): Promise<any> {
  const client = await neovimClient();
  const neovimIDE = getNeovimIDE();
  const cmdApi = commandApi();
  return handleCommandInternal(client, neovimIDE, cmdApi, ...args);
}

export function getCursorlessApiExternal(): Promise<CursorlessApi> {
  return getCursorlessApi();
}

export function neovimClientExternal(): NeovimClient {
  return neovimClient();
}

export function getNeovimIDEExternal(): NeovimIDE {
  return getNeovimIDE();
}
