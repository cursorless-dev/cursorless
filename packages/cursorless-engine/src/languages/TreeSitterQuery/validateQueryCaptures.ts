import { showError, simpleScopeTypeTypes } from "@cursorless/common";
import { escapeRegExp } from "lodash";
import { ide } from "../../singletons/ide.singleton";

const wildcard = "_";
const textFragment = "textFragment";
const dummy = "dummy";
const captureNames = [wildcard, ...simpleScopeTypeTypes];

const positionRelationships = ["prefix", "leading", "trailing"];
const positionSuffixes = ["startOf", "endOf"];

const rangeRelationships = [
  "domain",
  "removal",
  "interior",
  "iteration",
  "iteration.domain",
];
const rangeSuffixes = [
  "start",
  "end",
  "start.startOf",
  "start.endOf",
  "end.startOf",
  "end.endOf",
];

const allowedCaptures: string[] = [dummy, textFragment];

for (const suffix of rangeSuffixes) {
  allowedCaptures.push(`${textFragment}.${suffix}`);
}

for (const captureName of captureNames) {
  // Wildcard is not allowed by itself without a relationship
  if (captureName !== wildcard) {
    // eg: statement
    allowedCaptures.push(captureName);
  }

  for (const relationship of positionRelationships) {
    // eg: statement.leading
    allowedCaptures.push(`${captureName}.${relationship}`);

    for (const suffix of positionSuffixes) {
      // eg: statement.leading.endOf
      allowedCaptures.push(`${captureName}.${relationship}.${suffix}`);
    }
  }

  for (const relationship of rangeRelationships) {
    // eg: statement.domain
    allowedCaptures.push(`${captureName}.${relationship}`);

    for (const suffix of rangeSuffixes) {
      // eg: statement.domain.start | statement.domain.start.endOf
      allowedCaptures.push(`${captureName}.${relationship}.${suffix}`);
    }
  }
}

const allowedCapturesString = allowedCaptures.map(escapeRegExp).join("|");

// Not a comment. ie line is not starting with `;;`
// Group starts with `@` and is followed by a string that's not in allowed captures
const pattern = new RegExp(
  `^(?!;;).*(@(?!${allowedCapturesString})[.\\w]*)`,
  "gm",
);

export function validateQueryCaptures(file: string, rawQuery: string) {
  const matches = [...rawQuery.matchAll(pattern)];

  if (matches.length === 0) {
    return;
  }

  const errors = matches.map((match) => {
    const text = match.input!.slice(0, match.index!);
    const lineNumber = text.split("\n").length;
    const capture = match[1];
    return `${file}(${lineNumber}) invalid capture '${capture}'.`;
  });

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
