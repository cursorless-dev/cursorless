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

const HAT_NON_DEFAULT_SHAPE_NAMES = ["star", "valley"] as const;
export const HAT_SHAPE_NAMES = [
  ...HAT_NON_DEFAULT_SHAPE_NAMES,
  "default",
] as const;

export type HatColor = typeof HAT_COLORS[number];
export type HatShapeName = typeof HAT_SHAPE_NAMES[number];
type HatNonDefaultShapeName = typeof HAT_NON_DEFAULT_SHAPE_NAMES[number];
export type HatStyleName = HatColor | `${HatColor}-${HatNonDefaultShapeName}`;

export interface HatStyle {
  color: HatColor;
  shapeName: HatShapeName;
}

export const hatStyleMap = {
  ...Object.fromEntries(
    HAT_COLORS.map((color) => [color, { color, shapeName: "default" }])
  ),
  ...Object.fromEntries(
    HAT_COLORS.flatMap((color) =>
      HAT_NON_DEFAULT_SHAPE_NAMES.map((shapeName) => [
        `${color}-${shapeName}`,
        { color, shapeName },
      ])
    )
  ),
} as Record<HatStyleName, HatStyle>;
export const hatStyleNames = Object.keys(hatStyleMap);
