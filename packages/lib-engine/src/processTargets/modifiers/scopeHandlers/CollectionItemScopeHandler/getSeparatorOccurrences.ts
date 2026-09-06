import type { TextDocument } from "@cursorless/lib-common";
import { matchAll, Range } from "@cursorless/lib-common";

const separator = ",";

export const separatorRegex = new RegExp(separator, "gu");

export function getSeparatorOccurrences(document: TextDocument): Range[] {
  const text = document.getText();

  return matchAll(text, separatorRegex, (match): Range => {
    return new Range(
      document.positionAt(match.index!),
      document.positionAt(match.index! + match[0].length),
    );
  });
}
