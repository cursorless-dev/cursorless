import { matchAll, Range, type TextDocument } from "@cursorless/common";

const delimiter = ",";

export const delimiterRegex = new RegExp(delimiter, "g");

export function getDelimiterOccurrences(document: TextDocument): Range[] {
  const text = document.getText();

  return matchAll(text, delimiterRegex, (match): Range => {
    return new Range(
      document.positionAt(match.index!),
      document.positionAt(match.index! + match[0].length),
    );
  });
}
