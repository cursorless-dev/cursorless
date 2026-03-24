import type {
  ActionDescriptor,
  Command,
  CommandResponse,
} from "@cursorless/lib-common";
import { CURSORLESS_COMMAND_ID, LATEST_VERSION } from "@cursorless/lib-common";
import * as vscode from "vscode";

export async function runCursorlessCommand(
  command: Command,
  // oxlint-disable-next-line typescript/no-redundant-type-constituents
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
