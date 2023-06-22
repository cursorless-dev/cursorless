import { RangeTypeColors } from "./RangeTypeColors";

export function getColorsFromConfig(
  config: ScopeVisualizerColorConfig,
  rangeType: ColorConfigKey,
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

export type ColorConfigKey = keyof ScopeVisualizerThemeColorConfig;

export interface ScopeVisualizerColorConfig {
  light: ScopeVisualizerThemeColorConfig;
  dark: ScopeVisualizerThemeColorConfig;
}

interface ScopeVisualizerThemeColorConfig {
  domain: {
    background: string;
    borderSolid: string;
    borderPorous: string;
  };
  content: {
    background: string;
    borderSolid: string;
    borderPorous: string;
  };
  removal: {
    background: string;
    borderSolid: string;
    borderPorous: string;
  };
  iteration: {
    background: string;
    borderSolid: string;
    borderPorous: string;
  };
}
