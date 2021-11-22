import { SurroundingPairName } from "../../../typings/Types";

export interface IndividualDelimiter {
  text: string;
  side: "unknown" | "left" | "right";
  delimiter: SurroundingPairName;
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
