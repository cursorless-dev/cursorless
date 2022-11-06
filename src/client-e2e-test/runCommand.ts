import * as vscode from "vscode";
import { CURSORLESS_COMMAND_ID } from "../common/commandIds";
import type { Command } from "../core/commandRunner/command.types";

export function runCursorlessCommand(command: Command) {
  return vscode.commands.executeCommand(CURSORLESS_COMMAND_ID, command);
}
