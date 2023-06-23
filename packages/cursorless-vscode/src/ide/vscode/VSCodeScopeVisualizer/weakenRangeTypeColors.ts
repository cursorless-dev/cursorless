import tinycolor = require("tinycolor2");
import { RangeTypeColors } from "./RangeTypeColors";

const BORDER_WEAKENING = 0.8;
const BACKGROUND_WEAKENING = 0.8;

export function weakenRangeTypeColors(
  colors: RangeTypeColors,
): RangeTypeColors {
  return {
    background: {
      light: weakenColor(colors.background.light, BACKGROUND_WEAKENING),
      dark: weakenColor(colors.background.dark, BACKGROUND_WEAKENING),
    },
    borderSolid: {
      light: weakenColor(colors.borderSolid.light, BORDER_WEAKENING),
      dark: weakenColor(colors.borderSolid.dark, BORDER_WEAKENING),
    },
    borderPorous: {
      light: weakenColor(colors.borderPorous.light, BORDER_WEAKENING),
      dark: weakenColor(colors.borderPorous.dark, BORDER_WEAKENING),
    },
  };
}

function weakenColor(color: string, amount: number): string {
  const parsed = tinycolor(color);
  parsed.setAlpha(parsed.getAlpha() * amount);
  return parsed.toHex8String();
}
