import type { RunMode } from "@cursorless/common";

const ENV_NAME = "CURSORLESS_MODE";

export async function getRunMode(): Promise<RunMode> {
  const mode = await getCursorlessModeEnv();

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
        `Unexpected value for environment variable ${ENV_NAME}: ${mode}`,
      );
  }
}

async function getCursorlessModeEnv(): Promise<string | undefined> {
  try {
    const std = await import("std");
    return std.getenv(ENV_NAME);
  } catch (_ex) {
    return undefined;
  }
}
