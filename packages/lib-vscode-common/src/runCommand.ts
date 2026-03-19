import type {
  ActionDescriptor,
  Command,
  CommandResponse,
} from "@cursorless/common";
import { CURSORLESS_COMMAND_ID, LATEST_VERSION } from "@cursorless/common";
import * as vscode from "vscode";

export async function runCursorlessCommand(
  command: Command,
): Promise<CommandResponse | unknown> {
  return await vscode.commands.executeCommand(CURSORLESS_COMMAND_ID, command);
}

export async function runCursorlessAction(action: ActionDescriptor) {
  return runCursorlessCommand({
    version: LATEST_VERSION,
    usePrePhraseSnapshot: false,
    action,
  });
}
