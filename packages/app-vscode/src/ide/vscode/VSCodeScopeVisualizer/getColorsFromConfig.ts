import type {
  ScopeRangeType,
  ScopeVisualizerColorConfig,
} from "@cursorless/vscode-common";
import type { RangeTypeColors } from "./RangeTypeColors";

export function getColorsFromConfig(
  config: ScopeVisualizerColorConfig,
  rangeType: ScopeRangeType,
): RangeTypeColors {
  return {
    background: {
      light: config.light[rangeType].background,
      dark: config.dark[rangeType].background,
    },
    borderSolid: {
      light: config.light[rangeType].borderSolid,
      dark: config.dark[rangeType].borderSolid,
    },
    borderPorous: {
      light: config.light[rangeType].borderPorous,
      dark: config.dark[rangeType].borderPorous,
    },
  };
}
