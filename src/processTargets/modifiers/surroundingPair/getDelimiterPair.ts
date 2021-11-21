import { PairIndices, DelimiterOccurrence } from "./types";

export function getDelimiterPair(
  delimiter1: DelimiterOccurrence,
  delimiter2: DelimiterOccurrence
): PairIndices {
  const isDelimiter1First = delimiter1.offsets.start < delimiter2.offsets.start;
  const leftDelimiter = isDelimiter1First ? delimiter1 : delimiter2;
  const rightDelimiter = isDelimiter1First ? delimiter2 : delimiter1;

  return {
    leftDelimiter: leftDelimiter.offsets,
    rightDelimiter: rightDelimiter.offsets,
  };
}
