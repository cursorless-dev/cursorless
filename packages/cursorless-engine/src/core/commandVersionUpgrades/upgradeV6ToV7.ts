import type { CommandV6, CommandV7 } from "@cursorless/common";

export function upgradeV6ToV7(command: CommandV6): CommandV7 {
  return { ...command, version: 7 };
}
