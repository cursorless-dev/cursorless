import type { TextDocument } from "@cursorless/common";
import { matchAll } from "../../../../util/regex";
import type { DelimiterOccurrence, IndividualDelimiter } from "./types";

export function getDelimiterOccurrences(
  document: TextDocument,
  individualDelimiters: IndividualDelimiter[],
  delimiterRegex: RegExp,
): DelimiterOccurrence[] {
  const delimiterTextToDelimiterInfoMap = Object.fromEntries(
    individualDelimiters.map((individualDelimiter) => [
      individualDelimiter.text,
      individualDelimiter,
    ]),
  );

  const text = document.getText();

  return matchAll(text, delimiterRegex, (match): DelimiterOccurrence => {
    const text = match[0];
    const start = match.index!;
    const end = start + text.length;
    const { delimiter, side, isSingleLine } =
      delimiterTextToDelimiterInfoMap[text];
    return {
      delimiter,
      side,
      isSingleLine,
      start: document.positionAt(start),
      end: document.positionAt(end),
    };
  });
}
