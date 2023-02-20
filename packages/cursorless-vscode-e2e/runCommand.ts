import { CURSORLESS_COMMAND_ID } from "@cursorless/common";
import * as vscode from "vscode";
import type { Command } from "../common/types/command/command.types";

export function runCursorlessCommand(command: Command) {
  return vscode.commands.executeCommand(CURSORLESS_COMMAND_ID, command);
}
