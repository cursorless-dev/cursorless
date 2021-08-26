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

const HAT_NON_DEFAULT_GLYPHS = ["ninja"] as const;
const HAT_GLYPHS = [...HAT_NON_DEFAULT_GLYPHS, "default"] as const;

export type HatColor = typeof HAT_COLORS[number];
export type HatGlyphName = typeof HAT_GLYPHS[number];
type HatNonDefaultGlyph = typeof HAT_NON_DEFAULT_GLYPHS[number];
export type HatStyleName = HatColor | `${HatColor}-${HatNonDefaultGlyph}`;

export interface HatStyle {
  color: HatColor;
  glyphName: HatGlyphName;
}

export const hatStyleMap = {
  ...Object.fromEntries(
    HAT_COLORS.map((color) => [color, { color, glyphName: "default" }])
  ),
  ...Object.fromEntries(
    HAT_COLORS.flatMap((color) =>
      HAT_NON_DEFAULT_GLYPHS.map((glyphName) => [
        `${color}-${glyphName}`,
        { color, glyphName },
      ])
    )
  ),
} as Record<HatStyleName, HatStyle>;
export const hatStyleNames = Object.keys(hatStyleMap);
