import tinycolor = require("tinycolor2");
import type { RangeTypeColors } from "./RangeTypeColors";

/**
 * Blends two {@link RangeTypeColors} color configurations together according to
 * their alpha channels, with the top color rendered on top of the base color.
 *
 * @param baseColors The colors to render underneath
 * @param topColors The colors to render on top
 * @returns A color config that is a blend of the two color configs, with the
 * top color rendered on top of the base color
 */
export function blendRangeTypeColors(
  baseColors: RangeTypeColors,
  topColors: RangeTypeColors,
): RangeTypeColors {
  return {
    background: {
      light: blendColors(
        baseColors.background.light,
        topColors.background.light,
      ),
      dark: blendColors(baseColors.background.dark, topColors.background.dark),
    },
    borderSolid: {
      light: blendColors(
        baseColors.borderSolid.light,
        topColors.borderSolid.light,
      ),
      dark: blendColors(
        baseColors.borderSolid.dark,
        topColors.borderSolid.dark,
      ),
    },
    borderPorous: {
      light: blendColors(
        baseColors.borderPorous.light,
        topColors.borderPorous.light,
      ),
      dark: blendColors(
        baseColors.borderPorous.dark,
        topColors.borderPorous.dark,
      ),
    },
  };
}

/**
 * Blends two colors together according to their alpha channels, with the top
 * color rendered on top of the base color.
 *
 * Basd on https://gist.github.com/JordanDelcros/518396da1c13f75ee057
 *
 * @param base The color to render underneath
 * @param top The color to render on top
 * @returns A color that is a blend of the two colors, with the top color
 * rendered on top of the base color
 */
function blendColors(base: string, top: string): string {
  const baseRgba = tinycolor(base).toRgb();
  const topRgba = tinycolor(top).toRgb();
  const blendedAlpha = 1 - (1 - topRgba.a) * (1 - baseRgba.a);

  function interpolateChannel(channel: "r" | "g" | "b"): number {
    return Math.round(
      (topRgba[channel] * topRgba.a) / blendedAlpha +
        (baseRgba[channel] * baseRgba.a * (1 - topRgba.a)) / blendedAlpha,
    );
  }

  return tinycolor({
    r: interpolateChannel("r"),
    g: interpolateChannel("g"),
    b: interpolateChannel("b"),
    a: blendedAlpha,
  }).toHex8String();
}
