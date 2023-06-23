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

export interface StyledRange<T> {
  style: T;
  range: Range;
}

export type DecoratedRange = StyledRange<DecorationStyle>;

export interface DifferentiatedStyle<T> {
  style: T;
  differentiationIndex: number;
}

export interface DifferentiatedStyledRange<T> {
  differentiatedStyle: DifferentiatedStyle<T>;
  range: Range;
}

export interface DifferentiatedStyledRangeList<T> {
  differentiatedStyles: DifferentiatedStyle<T>;
  ranges: Range[];
}

export interface DifferentiatedRange {
  range: GeneralizedRange;
  differentiationIndex: number;
}

export interface DifferentiatedCharacterRange extends DifferentiatedRange {
  range: CharacterRange;
}

export interface DifferentiatedLineRange extends DifferentiatedRange {
  range: LineRange;
}
