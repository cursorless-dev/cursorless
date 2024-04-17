import {
  // CursorlessApi,
  NeovimIDE,
  // getCursorlessApi,
} from "@cursorless/neovim-common";
import { NeovimClient, NvimPlugin } from "neovim";
import { activate } from "./extension";
import { getNeovimIDE } from "./neovimHelpers";
// import { handleCommandInternal } from "./registerCommands";
import { neovimClient } from "./singletons/client.singleton";
import { commandApi } from "./singletons/cmdapi.singleton";
import { commandServerApi } from "./singletons/cmdsrvapi.singleton";
import { runRecordedTestCases } from "./suite/recorded_neovim_test";

/**
 * Extension entrypoint called by node-client on Neovim startup.
 * - Register the functions that are exposed to Neovim.
 *   Note that these function need to start with a capital letter to be callable from Neovim.
 */
export default function entry(plugin: NvimPlugin) {
  // We make sure the cursorless-neovim extension is only loaded once,
  // as otherwise we will run our first copy when loading the extension
  // and a different new copy for running the testcases
  // NOTE: this is the case because all the files are rolled up into a single index.cjs file
  // and node-client would reload that index.cjs file if "dev" was set to "true"
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
// export async function handleCommand(...args: any): Promise<any> {
//   const client = await neovimClient();
//   const neovimIDE = getNeovimIDE();
//   const cmdApi = commandApi();
//   const cmdSrvApi = commandServerApi();
//   return handleCommandInternal(client, neovimIDE, cmdApi, cmdSrvApi, ...args);
// }

export function neovimClientExternal(): NeovimClient {
  return neovimClient();
}

export function getNeovimIDEExternal(): NeovimIDE {
  return getNeovimIDE();
}
