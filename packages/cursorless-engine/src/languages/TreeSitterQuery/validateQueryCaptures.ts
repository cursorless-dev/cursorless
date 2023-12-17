import { showError, simpleScopeTypeTypes } from "@cursorless/common";
import { ide } from "../../singletons/ide.singleton";

function oneOfRegex(...values: string[]): string {
  return `(${values.join("|")})`;
}

const rangeRelationships = oneOfRegex(
  "domain",
  "removal",
  "interior",
  "prefix",
  "leading",
  "trailing",
  "iteration",
  "iteration.domain",
);
const baseScopeTypeRegex = oneOfRegex(...simpleScopeTypeTypes);
const scopeTypeRegex = `${baseScopeTypeRegex}(\\.${rangeRelationships})?|_\\.${rangeRelationships}`;
const baseRegex = `(textFragment|${scopeTypeRegex})(\\.start|\\.end)?(\\.startOf|\\.endOf)?`;
const regex = new RegExp(`^${oneOfRegex("_\\w+", "dummy", baseRegex)}$`);

// Not a comment. ie line is not starting with `;;`
// Capture starts with `@` and is followed by words and/or dots
const capturePattern = new RegExp(`^(?!;;).*@([\\w.]*)`, "gm");

export function validateQueryCaptures(file: string, rawQuery: string): void {
  const matches = rawQuery.matchAll(capturePattern);

  const errors: string[] = [];

  for (const match of matches) {
    const captureName = match[1];

    if (!regex.test(captureName)) {
      const lineNumber = match.input!.slice(0, match.index!).split("\n").length;
      errors.push(`${file}(${lineNumber}) invalid capture '@${captureName}'.`);
    }
  }

  if (errors.length === 0) {
    return;
  }

  const message = errors.join("\n");

  showError(
    ide().messages,
    "validateQueryCaptures.invalidCaptureName",
    message,
  );

  if (ide().runMode === "test") {
    throw new Error(message);
  }
}
