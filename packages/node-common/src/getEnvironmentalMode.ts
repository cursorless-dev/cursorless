import type { RunMode } from "@cursorless/common";

export function getEnvironmentalMode(): RunMode {
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
      throw new Error(`Invalid env CURSORLESS_MODE: ${mode}`);
  }
}
