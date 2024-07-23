import { matchAll, Range, type TextDocument } from "@cursorless/common";
import type { LanguageDefinition } from "../../../../languages/LanguageDefinition";
import type { DelimiterOccurrence, IndividualDelimiter } from "./types";
import { getDelimiterRegex } from "./getDelimiterRegex";

/**
 * Finds all occurrences of delimiters of a particular kind in a document.
 *
 * @param languageDefinition The language definition for the document
 * @param document The document
 * @param individualDelimiters A list of individual delimiters to search for
 * @returns A list of occurrences of the delimiters
 */
export function getDelimiterOccurrences(
  languageDefinition: LanguageDefinition | undefined,
  document: TextDocument,
  individualDelimiters: IndividualDelimiter[],
): DelimiterOccurrence[] {
  if (individualDelimiters.length === 0) {
    return [];
  }

  const delimiterRegex = getDelimiterRegex(individualDelimiters);

  const disqualifyDelimiters =
    languageDefinition?.getCaptureRanges(document, "disqualifyDelimiter") ?? [];
  const textFragments =
    languageDefinition?.getCaptureRanges(document, "textFragment") ?? [];

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
