import type {
  Command,
  CommandResponse} from "@cursorless/common";
import {
  CURSORLESS_COMMAND_ID,
} from "@cursorless/common";
import * as vscode from "vscode";

export async function runCursorlessCommand(
  command: Command,
): Promise<CommandResponse | unknown> {
  return await vscode.commands.executeCommand(CURSORLESS_COMMAND_ID, command);
}
