export type ScopeRangeType = "domain" | "content" | "removal" | "iteration";

export interface ScopeVisualizerColorConfig {
  light: ScopeVisualizerThemeColorConfig;
  dark: ScopeVisualizerThemeColorConfig;
}

type ScopeVisualizerThemeColorConfig = Record<
  ScopeRangeType,
  RangeTypeColorConfig
>;

interface RangeTypeColorConfig {
  background: string;
  borderSolid: string;
  borderPorous: string;
}
