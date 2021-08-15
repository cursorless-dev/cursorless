export const SUBWORD_MATCHER = /[A-Z]?[a-z]+|[A-Z]+(?![a-z])|[0-9]+/g;

export const DEBOUNCE_DELAY = 175;

export const COLORS = [
  "default",
  "blue",
  "green",
  "red",
  "yellow",
  "purple",
] as const;

export type SymbolColor = typeof COLORS[number];
