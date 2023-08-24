import type { SurroundingPairOffsets, DelimiterOccurrence } from "./types";

/**
 * Given a pair of delimiters, returns a pair of start and end offsets
 *
 * @param delimiter1 The first delimiter occurrence
 * @param delimiter2 The second delimiter occurrence
 * @returns A pair of start and end offsets for the given delimiters
 */
export function getSurroundingPairOffsets(
  delimiter1: DelimiterOccurrence,
  delimiter2: DelimiterOccurrence,
): SurroundingPairOffsets {
  const isDelimiter1First = delimiter1.offsets.start < delimiter2.offsets.start;
  const leftDelimiter = isDelimiter1First ? delimiter1 : delimiter2;
  const rightDelimiter = isDelimiter1First ? delimiter2 : delimiter1;

  return {
    leftDelimiter: leftDelimiter.offsets,
    rightDelimiter: rightDelimiter.offsets,
  };
}
