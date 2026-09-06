import type { Range } from "../types/Range";

export interface StyledRange {
  style: DecorationStyle;
  range: Range;
}

export interface DecorationStyle {
  top: BorderStyle;
  bottom: BorderStyle;
  left: BorderStyle;
  right: BorderStyle;
  isWholeLine?: boolean;
}

export enum BorderStyle {
  porous = "dashed",
  solid = "solid",
  none = "none",
}
