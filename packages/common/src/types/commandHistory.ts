import type { Command } from "./command/command.types";

/**
 * Represents a single line in a command history jsonl file.
 */
export interface CommandHistoryEntry {
  // UUID of the log entry.
  id: string;

  // Date of the log entry. eg: "2023-09-05"
  date: string;

  // Version of the Cursorless extension. eg: "0.28.0-c7bcf64d".
  cursorlessVersion: string;

  // Name of thrown error. eg: "NoContainingScopeError".
  error?: string;

  // UUID of the phrase.
  phraseId: string | undefined;

  // The command that was executed.
  command: Command;
}
