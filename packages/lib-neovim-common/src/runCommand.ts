import type { Command, CommandResponse } from "@cursorless/lib-common";
import { CURSORLESS_COMMAND_ID } from "@cursorless/lib-common";
import { getNeovimRegistry } from "@cursorless/lib-neovim-registry";

export async function runCursorlessCommand(
  command: Command,
): Promise<CommandResponse | unknown> {
  return await getNeovimRegistry().executeCommand(
    CURSORLESS_COMMAND_ID,
    command,
  );
}
