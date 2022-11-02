import * as vscode from "vscode";
import { cursorlessCommandId } from "../common/commandIds";
import type { Command } from "../core/commandRunner/command.types";

export function runCursorlessCommand(command: Command) {
  return vscode.commands.executeCommand(cursorlessCommandId, command);
}
