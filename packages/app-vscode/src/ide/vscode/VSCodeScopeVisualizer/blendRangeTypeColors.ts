import { blendColors } from "@cursorless/common";
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
