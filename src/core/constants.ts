export const SUBWORD_MATCHER = /[A-Z]?[a-z]+|[A-Z]+(?![a-z])|[0-9]+/g;

export const DEBOUNCE_DELAY = 175;

const HAT_COLORS = [
  "default",
  "blue",
  "green",
  "red",
  "yellow",
  "purple",
] as const;

const HAT_NON_DEFAULT_SHAPES = [
  "star",
  "tieFighter",
  "sun",
  "frame",
  "chevron",
  "curve",
  "eye",
  "rectangle",
] as const;

const HAT_MULTICOLOR_SHAPES = ["target"] as const;
export const HAT_SHAPES = [
  ...HAT_MULTICOLOR_SHAPES,
  ...HAT_NON_DEFAULT_SHAPES,
  "default",
] as const;

export type HatColor = typeof HAT_COLORS[number];
export type HatShape = typeof HAT_SHAPES[number];
type HatNonDefaultShape = typeof HAT_NON_DEFAULT_SHAPES[number];
export type HatStyleName = HatColor | `${HatColor}-${HatNonDefaultShape}`;

export interface HatStyle {
  color: HatColor;
  shape: HatShape;
  strokeColor?: HatColor;
}

export const hatStyleMap = {
  ...Object.fromEntries(
    HAT_COLORS.map((color) => [color, { color, shape: "default" }])
  ),
  ...Object.fromEntries(
    HAT_COLORS.flatMap((color) =>
      HAT_NON_DEFAULT_SHAPES.map((shape) => [
        `${color}-${shape}`,
        { color, shape },
      ])
    )
  ),
  ...Object.fromEntries(
    HAT_COLORS.flatMap((color) =>
      HAT_COLORS.map((strokeColor) => [
        `${color}-${strokeColor}-target`,
        {
          color,
          shape: "target",
          strokeColor,
        },
      ])
    )
  ),
} as Record<HatStyleName, HatStyle>;
export const hatStyleNames = Object.keys(hatStyleMap);
