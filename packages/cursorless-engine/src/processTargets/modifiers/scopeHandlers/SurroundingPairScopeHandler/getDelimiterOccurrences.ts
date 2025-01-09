import {
  matchAllIterator,
  Range,
  type SimpleScopeTypeType,
  type TextDocument,
} from "@cursorless/common";
import type { LanguageDefinition } from "../../../../languages/LanguageDefinition";
import type { QueryCapture } from "../../../../languages/TreeSitterQuery/QueryCapture";
import { getDelimiterRegex } from "./getDelimiterRegex";
import { OneWayRangeFinder } from "./OneWayRangeFinder";
import { OneWayNestedRangeFinder } from "./OneWayNestedRangeFinder";
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

  const capturesMap = languageDefinition?.getCapturesMap(document) ?? {};
  const disqualifyDelimiters = new OneWayRangeFinder(
    getSortedCaptures(capturesMap.disqualifyDelimiter),
  );
  const textFragments = new OneWayNestedRangeFinder(
    getSortedCaptures(capturesMap.textFragment),
  );

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
      const textFragmentRange =
        textFragments.getSmallestContaining(range)?.range;
      results.push({
        delimiterInfo: delimiterTextToDelimiterInfoMap[text],
        textFragmentRange,
        range,
      });
    }
  }

  return results;
}

function getSortedCaptures(items?: QueryCapture[]): QueryCapture[] {
  if (items == null) {
    return [];
  }
  items.sort((a, b) => a.range.start.compareTo(b.range.start));
  return items;
}
