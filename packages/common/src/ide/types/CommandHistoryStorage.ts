import type { CommandHistoryEntry } from "../../types/commandHistory";

export interface CommandHistoryStorage {
  appendEntry(fileName: string, entry: CommandHistoryEntry): Promise<void>;
  getEntries(): Promise<CommandHistoryEntry[]>;
}
