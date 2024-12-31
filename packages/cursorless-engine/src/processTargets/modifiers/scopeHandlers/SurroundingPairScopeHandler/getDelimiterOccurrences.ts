import { matchAll, Range, type TextDocument } from "@cursorless/common";
import type { LanguageDefinition } from "../../../../languages/LanguageDefinition";
import { getDelimiterRegex } from "./getDelimiterRegex";
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

  const disqualifyDelimiters =
    languageDefinition?.getCaptures(document, "disqualifyDelimiter") ?? [];
  const textFragments =
    languageDefinition?.getCaptures(document, "textFragment") ?? [];

  const delimiterTextToDelimiterInfoMap =
    getDelimiterTextToDelimiterInfoMap(individualDelimiters);

  const text = document.getText();

  return matchAll(text, delimiterRegex, (match): DelimiterOccurrence => {
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

function getDelimiterTextToDelimiterInfoMap(
  individualDelimiters: IndividualDelimiter[],
): Record<string, IndividualDelimiter> {
  return Object.fromEntries(
    individualDelimiters.flatMap((individualDelimiter) => {
      const results = [[individualDelimiter.text, individualDelimiter]];
      for (const prefix of individualDelimiter.prefixes) {
        const prefixText = prefix + individualDelimiter.text;
        const prefixDelimiter: IndividualDelimiter = {
          ...individualDelimiter,
          text: prefixText,
          side: "left",
        };
        results.push([prefixText, prefixDelimiter]);
      }
      return results;
    }),
  );
}
