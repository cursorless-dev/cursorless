import { Command, CURSORLESS_COMMAND_ID } from "@cursorless/common";
import * as vscode from "vscode";

export function runCursorlessCommand(command: Command) {
  return vscode.commands.executeCommand(CURSORLESS_COMMAND_ID, command);
}
