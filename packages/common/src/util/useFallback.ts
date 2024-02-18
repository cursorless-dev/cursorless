import type { Command } from "../types/command/command.types";

export function useFallback(command: Command): boolean {
  return command.version >= 7;
}
