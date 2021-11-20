import { Delimiter } from "../../../typings/Types";

export interface IndividualDelimiter {
  text: string;
  opposite: IndividualDelimiter;
  direction: "bidirectional" | "left" | "right";
  delimiter: Delimiter;
}

interface DelimiterIndices {
  start: number;
  end: number;
}

export interface PairIndices {
  leftDelimiter: DelimiterIndices;
  rightDelimiter: DelimiterIndices;
}

export interface DelimiterMatch {
  text: string;
  startIndex: number;
  endIndex: number;
}

export interface GeneratorResult {
  match: DelimiterMatch;
  delimiterInfo: IndividualDelimiter;
}
