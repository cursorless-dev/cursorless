import type { SimpleSurroundingPairName } from "@cursorless/common";
import { type Range } from "@cursorless/common";

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
   * Which side of the delimiter this refers to
   */
  side: DelimiterSide;

  /**
   * Which delimiter this represents
   */
  delimiterName: SimpleSurroundingPairName;

  /**
   * Whether the delimiter can only appear as part of a pair that is on a single
   * line
   */
  isSingleLine: boolean;

  /**
   * The text that can be used to represent this side of the delimiter, eg "("
   */
  text: string;
}

export interface IndividualSeparator {
  side: "separator";

  text: string;
}

/**
 * A occurrence of a surrounding pair delimiter in the document
 */
export interface DelimiterOccurrence<T extends { text: string }> {
  /**
   * Information about the delimiter itself
   */
  delimiterInfo: T;

  /**
   * The range of the delimiter in the document
   */
  range: Range;

  /**
   * If `true`, this delimiter is disqualified from being considered as a
   * surrounding pair delimiter, because it has been tagged as such based on a
   * parse tree query.
   */
  isDisqualified: boolean;

  /**
   * If the delimiter is part of a text fragment, eg a string or comment, this
   * will be the range of the text fragment.
   */
  textFragmentRange?: Range;
}

/**
 * A occurrence of a surrounding pair (both delimiters) in the document
 */
export interface SurroundingPairOccurrence {
  delimiterName: SimpleSurroundingPairName;
  openingDelimiterRange: Range;
  closingDelimiterRange: Range;
}

/**
 * A occurrence of a surrounding pair (both delimiters) in the document
 */
export interface CollectionItemOccurrence {
  openingDelimiterRange: Range;
  closingDelimiterRange: Range;
}
