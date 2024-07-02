import type { TextDocument } from "@cursorless/common";
import type { LanguageDefinition } from "../../../../languages/LanguageDefinition";
import { matchAll } from "../../../../util/regex";
import { getCaptureRanges } from "./getCaptureRanges";
import type { DelimiterOccurrence, IndividualDelimiter } from "./types";

export function getDelimiterOccurrences(
  languageDefinition: LanguageDefinition | undefined,
  document: TextDocument,
  individualDelimiters: IndividualDelimiter[],
  delimiterRegex: RegExp,
): DelimiterOccurrence[] {
  if (individualDelimiters.length === 0) {
    return [];
  }

  const queryMatches = languageDefinition?.getMatches(document) ?? [];
  const disqualifyDelimiters = getCaptureRanges(
    queryMatches,
    "disqualifyDelimiter",
  );
  const textFragments = getCaptureRanges(queryMatches, "textFragment");

  const delimiterTextToDelimiterInfoMap = Object.fromEntries(
    individualDelimiters.map((individualDelimiter) => [
      individualDelimiter.text,
      individualDelimiter,
    ]),
  );

  const text = document.getText();

  return matchAll(text, delimiterRegex, (match): DelimiterOccurrence => {
    const text = match[0];
    const startOffset = match.index!;
    const endOffset = startOffset + text.length;
    const start = document.positionAt(startOffset);
    const end = document.positionAt(endOffset);
    const isDisqualified = disqualifyDelimiters.some(
      (range) => range.contains(start) && range.contains(end),
    );
    const textFragment = textFragments.find(
      (range) => range.contains(start) && range.contains(end),
    );
    const { delimiter, side, isSingleLine } =
      delimiterTextToDelimiterInfoMap[text];
    return {
      delimiter,
      side,
      isSingleLine,
      isDisqualified,
      textFragment,
      start,
      end,
    };
  });
}
