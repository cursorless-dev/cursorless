import { SimpleSurroundingPairName, type Position } from "@cursorless/common";

/**
 * Used to indicate whether a particular side of the delimiter is left or right
 * or if we do not know. Note that the terms "opening" and "closing" could be
 * used instead of "left" and "right", respectively.
 */
export type DelimiterSide = "unknown" | "left" | "right";

/**
 * A description of one possible side of a delimiter
 */
export interface IndividualDelimiter {
  /**
   * The text that can be used to represent this side of the delimiter, eg "("
   */
  text: string;

  /**
   * Which side of the delimiter this refers to
   */
  side: DelimiterSide;

  /**
   * Which delimiter this represents
   */
  delimiter: SimpleSurroundingPairName;

  /**
   * Whether the delimiter is a single line delimiter
   */
  isSingleLine: boolean;
}

export interface DelimiterOccurrence {
  delimiter: SimpleSurroundingPairName;
  side: DelimiterSide;
  isSingleLine: boolean;
  start: Position;
  end: Position;
}

export interface SurroundingPairOccurrence {
  delimiter: SimpleSurroundingPairName;
  leftStart: Position;
  leftEnd: Position;
  rightStart: Position;
  rightEnd: Position;
}
