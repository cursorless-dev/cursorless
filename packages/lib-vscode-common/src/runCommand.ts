import * as vscode from "vscode";
import type {
  ActionDescriptor,
  Command,
  CommandResponse,
} from "@cursorless/lib-common";
import { CURSORLESS_COMMAND_ID, LATEST_VERSION } from "@cursorless/lib-common";

export async function runCursorlessCommand(
  command: Command,
  // oxlint-disable-next-line typescript/no-redundant-type-constituents
): Promise<CommandResponse | unknown> {
  return await vscode.commands.executeCommand(CURSORLESS_COMMAND_ID, command);
}

export function runCursorlessAction(
  action: ActionDescriptor,
): Promise<CommandResponse | unknown> {
  return runCursorlessCommand({
    version: LATEST_VERSION,
    usePrePhraseSnapshot: false,
    action,
  });
}
