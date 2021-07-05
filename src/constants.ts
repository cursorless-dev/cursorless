export const DEBOUNCE_DELAY = 175;

export const TOKEN_MATCHER = /[a-zA-Z_0-9]+|[^\s\w]/g;

export const SUBWORD_MATCHER = /[A-Z]?[a-z]+/g;

export const COLORS = [
  "default",
  "blue",
  "green",
  "red",
  "yellow",
  "mauve",
] as const;

export type SymbolColor = typeof COLORS[number];

export const DEFAULT_HAT_WIDTH_TO_CHARACTER_WITH_RATIO = 0.39;
export const DEFAULT_HAT_VERTICAL_OFFSET = -3.47;
