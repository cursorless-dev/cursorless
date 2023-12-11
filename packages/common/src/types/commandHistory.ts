import type { CommandComplete } from "./command/command.types";

/**
 * Represents a single line in a command history jsonl file.
 */
export interface CommandHistoryItem {
  // eg: "2023-09-05"
  date: string;

  // eg: "0.28.0-c7bcf64d"
  cursorlessVersion: string;

  command: CommandComplete;
}
