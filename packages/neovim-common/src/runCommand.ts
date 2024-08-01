import type {
  Command,
  CommandResponse} from "@cursorless/common";
import {
  CURSORLESS_COMMAND_ID,
} from "@cursorless/common";
import { getNeovimRegistry } from "@cursorless/neovim-registry";

export async function runCursorlessCommand(
  command: Command,
): Promise<CommandResponse | unknown> {
  return await getNeovimRegistry().executeCommand(
    CURSORLESS_COMMAND_ID,
    command,
  );
}
