import { Delimiter } from "../../../typings/Types";

export interface IndividualDelimiter {
  text: string;
  opposite: IndividualDelimiter;
  side: "unknown" | "left" | "right";
  delimiter: Delimiter;
}

export interface Offsets {
  start: number;
  end: number;
}

export interface PairIndices {
  leftDelimiter: Offsets;
  rightDelimiter: Offsets;
}

export interface PossibleDelimiterOccurrence {
  delimiterInfo?: IndividualDelimiter;
  offsets: Offsets;
}

export interface DelimiterOccurrence extends PossibleDelimiterOccurrence {
  delimiterInfo: IndividualDelimiter;
}

export type DelimiterOccurrenceGenerator = Generator<
  DelimiterOccurrence,
  void,
  unknown
>;
