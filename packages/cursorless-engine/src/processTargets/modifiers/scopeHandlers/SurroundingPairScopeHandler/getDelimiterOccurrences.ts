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
import { RangeLookupTree } from "./RangeLookupTree";
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

  const disqualifyDelimiters = new OneWayRangeFinder(
    getSortedCaptures(languageDefinition, document, "disqualifyDelimiter"),
  );
  // We need a tree for text fragments since they can be nested
  const textFragments = new RangeLookupTree(
    getSortedCaptures(languageDefinition, document, "textFragment"),
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
        textFragments.getSmallLestContaining(range)?.range;
      results.push({
        delimiterInfo: delimiterTextToDelimiterInfoMap[text],
        textFragmentRange,
        range,
      });
    }
  }

  return results;
}

function getSortedCaptures(
  languageDefinition: LanguageDefinition | undefined,
  document: TextDocument,
  captureName: SimpleScopeTypeType,
): QueryCapture[] {
  const items = languageDefinition?.getCaptures(document, captureName) ?? [];
  items.sort((a, b) => a.range.start.compareTo(b.range.start));
  return items;
}
