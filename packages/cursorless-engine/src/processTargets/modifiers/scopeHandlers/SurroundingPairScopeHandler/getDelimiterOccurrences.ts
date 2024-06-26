import { matchAll } from "../../../../util/regex";
import type { DelimiterOccurrence, IndividualDelimiter } from "./types";

export function getDelimiterOccurrences(
  text: string,
  individualDelimiters: IndividualDelimiter[],
  delimiterRegex: RegExp,
): DelimiterOccurrence[] {
  const delimiterTextToDelimiterInfoMap = Object.fromEntries(
    individualDelimiters.map((individualDelimiter) => [
      individualDelimiter.text,
      individualDelimiter,
    ]),
  );

  return matchAll(text, delimiterRegex, (match): DelimiterOccurrence => {
    const text = match[0];
    const start = match.index!;
    const end = start + text.length;
    const { delimiter, side } = delimiterTextToDelimiterInfoMap[text];
    return { start, end, delimiter, side };
  });
}
