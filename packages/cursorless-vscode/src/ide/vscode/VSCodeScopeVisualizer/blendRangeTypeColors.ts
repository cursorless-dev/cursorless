import tinycolor = require("tinycolor2");
import { RangeTypeColors } from "./RangeTypeColors";

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
