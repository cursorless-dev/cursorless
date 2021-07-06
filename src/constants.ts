export const SUBWORD_MATCHER = /[A-Z]?[a-z]+/g;

export const DEBOUNCE_DELAY = 175;

export const COLORS = [
  "default",
  "blue",
  "green",
  "red",
  "yellow",
  "mauve",
] as const;

export type SymbolColor = typeof COLORS[number];
