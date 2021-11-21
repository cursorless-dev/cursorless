import {
  PairIndices,
  DelimiterOccurrence
} from "./types";

export function getDelimiterPair(
  delimiter1: DelimiterOccurrence,
  delimiter2: DelimiterOccurrence): PairIndices {
  const isDelimiter1First = delimiter1.startIndex < delimiter2.startIndex;
  const leftDelimiter = isDelimiter1First ? delimiter1 : delimiter2;
  const rightDelimiter = isDelimiter1First ? delimiter2 : delimiter1;

  return {
    leftDelimiter: {
      start: leftDelimiter.startIndex,
      end: leftDelimiter.endIndex,
    },
    rightDelimiter: {
      start: rightDelimiter.startIndex,
      end: rightDelimiter.endIndex,
    },
  };
}
