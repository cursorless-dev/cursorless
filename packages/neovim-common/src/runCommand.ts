import {
  Command,
  // CommandServerApi,
  CURSORLESS_COMMAND_ID,
} from "@cursorless/common";
import { neovimRegistry } from "@cursorless/neovim-registry";
// import { CommandApi } from "@cursorless/cursorless-engine";
// import { NeovimClient } from "neovim";
// import { handleCommandInternal } from "../../cursorless-neovim/src/registerCommands";
// import { NeovimIDE } from "./ide/neovim/NeovimIDE";
//import * as vscode from "vscode";

export async function runCursorlessCommand(
  // client: NeovimClient,
  // neovimIDE: NeovimIDE,
  // commandApi: CommandApi,
  // cmdSrvApi: CommandServerApi,
  command: Command,
) {
  //return vscode.commands.executeCommand(CURSORLESS_COMMAND_ID, command);
  return await neovimRegistry.executeCommand(CURSORLESS_COMMAND_ID, command);
  // return handleCommandInternal(
  //   client,
  //   neovimIDE,
  //   commandApi,
  //   cmdSrvApi,
  //   CURSORLESS_COMMAND_ID,
  //   command,
  // );
}
