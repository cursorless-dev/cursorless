import { Delimiter } from "../../../typings/Types";

export interface IndividualDelimiter {
  text: string;
  opposite: IndividualDelimiter;
  side: "unknown" | "left" | "right";
  delimiter: Delimiter;
}

export interface DelimiterOffsets {
  start: number;
  end: number;
}

export interface PairIndices {
  leftDelimiter: DelimiterOffsets;
  rightDelimiter: DelimiterOffsets;
}

export interface DelimiterOccurrence {
  delimiterInfo: IndividualDelimiter;
  offsets: DelimiterOffsets;
}

export type DelimiterOccurrenceGenerator = Generator<
  DelimiterOccurrence,
  void,
  unknown
>;
