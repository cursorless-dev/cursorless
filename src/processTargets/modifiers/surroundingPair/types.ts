import { SimpleSurroundingPairName } from "../../../typings/Types";

export type DelimiterSide = "unknown" | "left" | "right";

export interface IndividualDelimiter {
  text: string;
  side: DelimiterSide;
  delimiter: SimpleSurroundingPairName;
}

export interface Offsets {
  start: number;
  end: number;
}

export interface SurroundingPairOffsets {
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
