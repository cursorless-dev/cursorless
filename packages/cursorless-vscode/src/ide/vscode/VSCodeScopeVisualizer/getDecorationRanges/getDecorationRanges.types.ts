import { Range } from "@cursorless/common";

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
