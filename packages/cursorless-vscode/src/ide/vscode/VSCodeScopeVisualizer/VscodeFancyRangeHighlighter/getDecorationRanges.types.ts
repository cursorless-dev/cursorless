import {
  CharacterRange,
  GeneralizedRange,
  LineRange,
  Range,
} from "@cursorless/common";

export enum BorderStyle {
  porous = "dashed",
  solid = "solid",
  none = "none",
}

export interface DecorationStyle {
  top: BorderStyle;
  bottom: BorderStyle;
  left: BorderStyle;
  right: BorderStyle;
  isWholeLine?: boolean;
}

export interface DifferentiatedStyle {
  style: DecorationStyle;
  differentiationIndex: number;
}

export interface StyledRange {
  style: DecorationStyle;
  range: Range;
}

export interface DifferentiatedStyledRange {
  differentiatedStyle: DifferentiatedStyle;
  range: Range;
}

export interface DifferentiatedStyledRangeList {
  differentiatedStyles: DifferentiatedStyle;
  ranges: Range[];
}

export interface DifferentiatedGeneralizedRange {
  range: GeneralizedRange;
  differentiationIndex: number;
}

export interface DifferentiatedCharacterRange
  extends DifferentiatedGeneralizedRange {
  range: CharacterRange;
}

export interface DifferentiatedLineRange
  extends DifferentiatedGeneralizedRange {
  range: LineRange;
}
