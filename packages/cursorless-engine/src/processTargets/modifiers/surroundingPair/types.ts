import type { SimpleSurroundingPairName } from "@cursorless/common";

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
}

/**
 * Offsets within a range or document
 */
export interface Offsets {
  start: number;
  end: number;
}

/**
 * The offsets of the left and right delimiter of a delimiter pair within
 * range or document.
 */
export interface SurroundingPairOffsets {
  leftDelimiter: Offsets;
  rightDelimiter: Offsets;
}

/**
 * A possible occurrence with of a delimiter within arranger document including
 * its offsets, as well as information about the delimiter itself. We allow
 * `delimiterInfo` to be `null` so that implementers can lazily determine
 * whether or not this is actually a delimiter, and return `null` if it is not
 */
export interface PossibleDelimiterOccurrence {
  /**
   * Information about the delimiter. If `null` then this delimiter occurrence
   * should be ignored
   */
  delimiterInfo?: IndividualDelimiter;

  /**
   * The offsets of the delimiter occurrence
   */
  offsets: Offsets;
}

/**
 * A confirmed occurrence of a delimiter within a document
 */
export interface DelimiterOccurrence extends PossibleDelimiterOccurrence {
  delimiterInfo: IndividualDelimiter;
}
