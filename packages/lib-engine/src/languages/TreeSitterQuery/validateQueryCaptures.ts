import { showError } from "@cursorless/lib-common";
import type { IDE } from "@cursorless/lib-common";
import { isCaptureAllowed } from "./captureNames";

// Consume strings and comments without capturing their contents.
// Capture starts with `@` and is followed by words and/or dots.
const capturePattern = /"(?:\\[\s\S]|[^"\\])*"|;[^\r\n]*|@([\w.]*)/gu;

export function validateQueryCaptures(
  ide: IDE,
  file: string,
  rawQuery: string,
): void {
  const matches = rawQuery.matchAll(capturePattern);

  const errors: string[] = [];

  for (const match of matches) {
    const captureName = match[1];

    if (captureName == null) {
      continue;
    }

    if (
      captureName.length > 1 &&
      !captureName.includes(".") &&
      captureName.startsWith("_")
    ) {
      // Allow @_foo dummy captures to use for referring to in query predicates
      continue;
    }

    if (!isCaptureAllowed(captureName)) {
      const lineNumber = match.input.slice(0, match.index).split("\n").length;
      errors.push(`${file}(${lineNumber}) invalid capture '@${captureName}'.`);
    }
  }

  if (errors.length === 0) {
    return;
  }

  const message = errors.join("\n");

  void showError(
    ide.messages,
    "validateQueryCaptures.invalidCaptureName",
    message,
  );

  if (ide.runMode === "test") {
    throw new Error(message);
  }
}
