import type { Command } from "../types/command/command.types";

export function clientSupportsFallback(command: Command): boolean {
  return command.version >= 7;
}
