import { SurroundingPairName } from "../../../typings/Types";

export interface IndividualDelimiter {
  text: string;
  side: "left" | "right";
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
  possibleDelimiterInfos: IndividualDelimiter[];
  offsets: Offsets;
}

export interface DelimiterOccurrence {
  delimiterInfo: IndividualDelimiter;
  offsets: Offsets;
}

export type DelimiterOccurrenceGenerator = Generator<
  DelimiterOccurrence,
  void,
  unknown
>;
