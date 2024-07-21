import type { RunMode } from "@cursorless/common";

export function getRunMode(): RunMode {
  const mode = getCursorlessModeEnv();

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

function getCursorlessModeEnv(): string | undefined {
  try {
    return getenv("CURSORLESS_MODE");
  } catch (_ex) {
    return undefined;
  }
}
