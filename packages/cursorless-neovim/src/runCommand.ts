import {
  Command,
  CommandServerApi,
  CURSORLESS_COMMAND_ID,
} from "@cursorless/common";
import { handleCommandInternal } from "./registerCommands";
import { NeovimClient } from "neovim";
import { NeovimIDE } from "./ide/neovim/NeovimIDE";
import { CommandApi } from "@cursorless/cursorless-engine";
//import * as vscode from "vscode";

export function runCursorlessCommand(
  client: NeovimClient,
  neovimIDE: NeovimIDE,
  commandApi: CommandApi,
  cmdSrvApi: CommandServerApi,
  command: Command,
) {
  //return vscode.commands.executeCommand(CURSORLESS_COMMAND_ID, command);
  return handleCommandInternal(
    client,
    neovimIDE,
    commandApi,
    cmdSrvApi,
    CURSORLESS_COMMAND_ID,
    command,
  );
}
