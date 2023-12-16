import { showError, simpleScopeTypeTypes } from "@cursorless/common";
import { escapeRegExp } from "lodash";
import { basename } from "node:path";
import { ide } from "../../singletons/ide.singleton";

const wildcard = "_";
const textFragment = "textFragment";
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

const allowedCaptures: string[] = ["dummy", textFragment];

for (const suffix of rangeSuffixes) {
  allowedCaptures.push(`${textFragment}.${suffix}`);
}

for (const captureName of captureNames) {
  if (captureName !== wildcard) {
    allowedCaptures.push(captureName);
  }

  for (const relationship of positionRelationships) {
    allowedCaptures.push(`${captureName}.${relationship}`);

    for (const suffix of positionSuffixes) {
      allowedCaptures.push(`${captureName}.${relationship}.${suffix}`);
    }
  }

  for (const relationship of rangeRelationships) {
    allowedCaptures.push(`${captureName}.${relationship}`);

    for (const suffix of rangeSuffixes) {
      allowedCaptures.push(`${captureName}.${relationship}.${suffix}`);
    }
  }
}

const allowedCapturesString = allowedCaptures.map(escapeRegExp).join("|");

const pattern = new RegExp(
  `^(?!;;).*(@(?!${allowedCapturesString})[.\\w]*)`,
  "gm",
);

export function validateQueryCaptures(queryPath: string, rawQuery: string) {
  const matches = [...rawQuery.matchAll(pattern)];

  if (matches.length === 0) {
    return;
  }

  const file = basename(queryPath);

  const errors = matches.map((match) => {
    const text = match.input!.slice(0, match.index!);
    const lineNumber = text.split("\n").length;
    const capture = match[1];
    return `${file}(${lineNumber}) invalid capture '${capture}'.`;
  });

  const message = errors.join("\n");

  console.error(message);

  showError(ide().messages, "TreeSitterQuery.validateCaptures", message);
}
