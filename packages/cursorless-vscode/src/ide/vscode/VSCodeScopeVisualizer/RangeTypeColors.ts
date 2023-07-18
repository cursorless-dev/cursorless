/**
 * The colors used to render a range type, such as "domain", "content", etc.
 */
export interface RangeTypeColors {
  background: ThemeColors;
  borderSolid: ThemeColors;
  borderPorous: ThemeColors;
}

interface ThemeColors {
  light: string;
  dark: string;
}
