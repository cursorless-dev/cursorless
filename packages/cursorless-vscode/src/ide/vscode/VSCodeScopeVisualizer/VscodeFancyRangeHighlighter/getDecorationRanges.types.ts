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
  range: Range;
  style: T;
}

export type DecoratedRange = StyledRange<DecorationStyle>;

export interface StyleParameters<T> {
  style: T;
  differentiationIndex: number;
}

export interface StyleParametersRanges<T> {
  styleParameters: StyleParameters<T>;
  ranges: Range[];
}

export interface DifferentiatedStyledRange<T> {
  range: Range;
  style: T;
  differentiationIndex: number;
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
