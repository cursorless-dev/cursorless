import { matchAll, Range, type TextDocument } from "@cursorless/common";
import type { LanguageDefinition } from "../../../../languages/LanguageDefinition";
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
    const range = new Range(
      document.positionAt(match.index!),
      document.positionAt(match.index! + text.length),
    );

    return {
      delimiterInfo: delimiterTextToDelimiterInfoMap[text],
      isDisqualified: disqualifyDelimiters.some((r) => r.contains(range)),
      textFragmentRange: textFragments.find((r) => r.contains(range)),
      range,
    };
  });
}
