import type { CommandHistoryEntry } from "../../types/commandHistory";

/**
 * Used by command history machinery to store entries.
 */
export interface CommandHistoryStorage {
  /**
   * Append an entry to a command history file.
   *
   * @param fileName The name of the file to append the entry to. We usually use
   * the a name derived from the current month to do a form of log rotation.
   * @param entry The entry to append to the file
   */
  appendEntry(fileName: string, entry: CommandHistoryEntry): Promise<void>;

  /**
   * Get all entries from all command history files.
   */
  getEntries(): Promise<CommandHistoryEntry[]>;
}
