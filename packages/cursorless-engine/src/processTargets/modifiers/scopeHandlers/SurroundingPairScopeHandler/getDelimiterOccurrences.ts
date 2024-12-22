import { matchAll, Range, type TextDocument } from "@cursorless/common";
import type { LanguageDefinition } from "../../../../languages/LanguageDefinition";
import { getDelimiterRegex } from "./getDelimiterRegex";
import { RangeIterator } from "./RangeIterator";
import type { DelimiterOccurrence, IndividualDelimiter } from "./types";

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

  const captures = languageDefinition?.getMultipleCaptures(document, [
    "disqualifyDelimiter",
    "textFragment",
  ]);
  const disqualifyDelimiters = captures?.disqualifyDelimiter ?? [];
  const textFragments = captures?.textFragment ?? [];

  const disqualifyDelimitersIterator = new RangeIterator(disqualifyDelimiters);
  const textFragmentsIterator = new RangeIterator(textFragments);

  const delimiterTextToDelimiterInfoMap = Object.fromEntries(
    individualDelimiters.map((individualDelimiter) => [
      individualDelimiter.text,
      individualDelimiter,
    ]),
  );

  const isDisqualified = (range: Range): boolean => {
    const delimiter = disqualifyDelimitersIterator.getContaining(range);
    return delimiter != null && !delimiter.hasError();
  };

  const getTextFragmentRange = (range: Range): Range | undefined => {
    return textFragmentsIterator.getContaining(range)?.range;
  };

  const text = document.getText();

  return matchAll(text, delimiterRegex, (match): DelimiterOccurrence => {
    const text = match[0];
    const range = new Range(
      document.positionAt(match.index!),
      document.positionAt(match.index! + text.length),
    );

    return {
      delimiterInfo: delimiterTextToDelimiterInfoMap[text],
      isDisqualified: isDisqualified(range),
      textFragmentRange: getTextFragmentRange(range),
      range,
    };
  });
}
