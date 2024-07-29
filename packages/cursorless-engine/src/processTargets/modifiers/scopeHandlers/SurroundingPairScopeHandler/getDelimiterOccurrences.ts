import { matchAll, Range, type TextDocument } from "@cursorless/common";
import type { LanguageDefinition } from "../../../../languages/LanguageDefinition";
import { getDelimiterRegex } from "./getDelimiterRegex";
import type { DelimiterOccurrence } from "./types";

/**
 * Finds all occurrences of delimiters of a particular kind in a document.
 *
 * @param languageDefinition The language definition for the document
 * @param document The document
 * @param individualDelimiters A list of individual delimiters to search for
 * @returns A list of occurrences of the delimiters
 */
export function getDelimiterOccurrences<T extends { text: string }>(
  languageDefinition: LanguageDefinition | undefined,
  document: TextDocument,
  individualDelimiters: T[],
): DelimiterOccurrence<T>[] {
  if (individualDelimiters.length === 0) {
    return [];
  }

  const delimiterRegex = getDelimiterRegex(individualDelimiters);

  const disqualifyDelimiters =
    languageDefinition?.getCaptures(document, "disqualifyDelimiter") ?? [];
  const textFragments =
    languageDefinition?.getCaptures(document, "textFragment") ?? [];

  const delimiterTextToDelimiterInfoMap = Object.fromEntries(
    individualDelimiters.map((individualDelimiter) => [
      individualDelimiter.text,
      individualDelimiter,
    ]),
  );

  const text = document.getText();

  return matchAll(text, delimiterRegex, (match): DelimiterOccurrence<T> => {
    const text = match[0];
    const range = new Range(
      document.positionAt(match.index!),
      document.positionAt(match.index! + text.length),
    );

    const isDisqualified = disqualifyDelimiters.some(
      (c) => c.range.contains(range) && !c.hasError(),
    );

    const textFragmentRange = textFragments.find((c) =>
      c.range.contains(range),
    )?.range;

    return {
      delimiterInfo: delimiterTextToDelimiterInfoMap[text],
      isDisqualified,
      textFragmentRange,
      range,
    };
  });
}
