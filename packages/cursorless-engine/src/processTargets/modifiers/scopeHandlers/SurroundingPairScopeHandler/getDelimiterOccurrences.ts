import { matchAllIterator, Range, type TextDocument } from "@cursorless/common";
import type { LanguageDefinition } from "../../../../languages/LanguageDefinition";
import type { QueryCapture } from "../../../../languages/TreeSitterQuery/QueryCapture";
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

  const captures = languageDefinition?.getMultipleCaptures(document, [
    "disqualifyDelimiter",
    "textFragment",
  ]);
  const disqualifyDelimiters = createRangeIterator(
    captures?.disqualifyDelimiter,
  );
  const textFragments = createRangeIterator(captures?.textFragment);

  const delimiterTextToDelimiterInfoMap = Object.fromEntries(
    individualDelimiters.map((individualDelimiter) => [
      individualDelimiter.text,
      individualDelimiter,
    ]),
  );

  const regexMatches = matchAllIterator(
    document.getText(),
    getDelimiterRegex(individualDelimiters),
  );

  const results: DelimiterOccurrence[] = [];

  for (const match of regexMatches) {
    const text = match[0];
    const range = new Range(
      document.positionAt(match.index!),
      document.positionAt(match.index! + text.length),
    );

    const delimiter = disqualifyDelimiters.getContaining(range);
    const isDisqualified = delimiter != null && !delimiter.hasError();

    if (!isDisqualified) {
      results.push({
        delimiterInfo: delimiterTextToDelimiterInfoMap[text],
        textFragmentRange: textFragments.getContaining(range)?.range,
        range,
      });
    }
  }

  return results;
}

function createRangeIterator(
  captures: QueryCapture[] | undefined,
): RangeIterator<QueryCapture> {
  const items = captures ?? [];
  items.sort((a, b) => a.range.start.compareTo(b.range.start));
  return new RangeIterator(items);
}
