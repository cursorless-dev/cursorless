import { blendColors } from "@cursorless/common";
import type { RangeTypeColors } from "./types";

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
    background: blendColors(baseColors.background, topColors.background),
    borderSolid: blendColors(baseColors.borderSolid, topColors.borderSolid),
    borderPorous: blendColors(baseColors.borderPorous, topColors.borderPorous),
  };
}
