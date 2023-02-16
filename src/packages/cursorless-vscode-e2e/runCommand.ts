import { CURSORLESS_COMMAND_ID } from "@cursorless/common";
import * as vscode from "vscode";
import type { Command } from "../../libs/cursorless-engine/core/commandRunner/typings/command.types";

export function runCursorlessCommand(command: Command) {
  return vscode.commands.executeCommand(CURSORLESS_COMMAND_ID, command);
}
