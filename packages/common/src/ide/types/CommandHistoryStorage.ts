import type { CommandHistoryEntry } from "../../types/commandHistory";

export interface CommandHistoryStorage {
  append(fileName: string, entry: CommandHistoryEntry): Promise<void>;
}

// const data = JSON.stringify(historyItem) + "\n";
