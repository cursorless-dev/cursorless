import { Command, CURSORLESS_COMMAND_ID } from "@cursorless/common";
import { handleCommandInternal } from "./registerCommands";
import { NeovimClient } from "neovim";
import { NeovimIDE } from "./ide/neovim/NeovimIDE";
import { CommandApi } from "@cursorless/cursorless-engine";
//import * as vscode from "vscode";

export function runCursorlessCommand(
  client: NeovimClient,
  neovimIDE: NeovimIDE,
  commandApi: CommandApi,
  command: Command,
) {
  //return vscode.commands.executeCommand(CURSORLESS_COMMAND_ID, command);
  return handleCommandInternal(
    client,
    neovimIDE,
    commandApi,
    CURSORLESS_COMMAND_ID,
    command,
  );
}
