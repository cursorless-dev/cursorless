import type { CommandComplete } from "./command/command.types";

export interface CommandHistory {
  append(command: CommandComplete): Promise<void>;
  dispose(): void;
}

export interface CommandHistoryItem {
  date: string;
  cursorlessVersion: string;
  command: CommandComplete;
}
