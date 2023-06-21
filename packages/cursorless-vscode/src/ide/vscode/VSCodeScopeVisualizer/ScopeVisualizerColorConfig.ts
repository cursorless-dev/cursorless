
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
}
