import type {
  DecorationStyle,
  GeneralizedRange,
  Range,
} from "@cursorless/common";

/**
 * A decoration style that is differentiated from other styles by a number. We
 * use this number to ensure that adjacent ranges are rendered with different
 * TextEditorDecorationTypes, so that they don't get merged together due to a
 * VSCode bug.
 */
export interface DifferentiatedStyle {
  style: DecorationStyle;

  /**
   * A number that is different from the differentiation indices of any other
   * ranges that are touching this range.
   */
  differentiationIndex: number;
}

export interface DifferentiatedStyledRange {
  differentiatedStyle: DifferentiatedStyle;
  range: Range;
}

export interface DifferentiatedStyledRangeList {
  differentiatedStyle: DifferentiatedStyle;
  ranges: Range[];
}

export interface DifferentiatedGeneralizedRange {
  range: GeneralizedRange;

  /**
   * A number that is different from the differentiation indices of any other
   * ranges that are touching this range.
   */
  differentiationIndex: number;
}
