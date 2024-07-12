import type { RunMode } from "@cursorless/common";

/**
 * Get the current run mode of the application as defined by the CURSORLESS_MODE
 * environment variable.
 *
 * @returns The current run mode of the application
 */
export function nodeGetRunMode(): RunMode {
  const mode = process.env.CURSORLESS_MODE;
  switch (mode) {
    case undefined:
    case "production":
      return "production";
    case "development":
      return "development";
    case "test":
      return "test";
    default:
      throw new Error(
        `Unexpected value for environment variable CURSORLESS_MODE: ${mode}`,
      );
  }
}
