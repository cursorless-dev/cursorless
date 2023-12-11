import type { CommandComplete } from "./command/command.types";

export interface CommandHistoryItem {
  // eg 2023-09-05
  date: string;

  // eg 0.28.0-c7bcf64d
  cursorlessVersion: string;

  command: CommandComplete;
}
