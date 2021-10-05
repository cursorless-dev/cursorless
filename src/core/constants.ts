export const SUBWORD_MATCHER = /[A-Z]?[a-z]+|[A-Z]+(?![a-z])|[0-9]+/g;

export const DEBOUNCE_DELAY = 175;

const HAT_NON_DEFAULT_COLORS = [
  "blue",
  "green",
  "red",
  "pink",
  "yellow",
] as const;

export const HAT_COLORS = ["default", ...HAT_NON_DEFAULT_COLORS] as const;

export const HAT_NON_DEFAULT_SHAPES = [
  "ex",
  "fox",
  "wing",
  "hole",
  "frame",
  "curve",
  "eye",
  "play",
  "bolt",
  "star",
] as const;

export const HAT_SHAPES = ["default", ...HAT_NON_DEFAULT_SHAPES] as const;

export type HatColor = typeof HAT_COLORS[number];
export type HatShape = typeof HAT_SHAPES[number];
export type HatNonDefaultColor = typeof HAT_NON_DEFAULT_COLORS[number];
export type HatNonDefaultShape = typeof HAT_NON_DEFAULT_SHAPES[number];
export type HatStyleName = HatColor | `${HatColor}-${HatNonDefaultShape}`;

export interface HatStyle {
  color: HatColor;
  shape: HatShape;
}
