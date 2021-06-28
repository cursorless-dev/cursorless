const REPEATABLE_SYMBOLS = [
  "\\+",
  "-",
  "\\*",
  "/",
  "=",
  "<",
  ">",
  "_",
  "#",
  "\\.",
  "\\|",
  "&"
].map(s => `${s}+`).join("|");

const FIXED_TOKENS = [
  "!==",
  "!=",
  "\\+=",
  "-=",
  "\\*=",
  "/=",
  "%=",
  "<=",
  ">="
].join("|");

export const TOKEN_MATCHER = new RegExp(`[a-zA-Z_0-9]+|${FIXED_TOKENS}|${REPEATABLE_SYMBOLS}|[^\\s\\w]`, "g");

export const SUBWORD_MATCHER = /[A-Z]?[a-z]+/g;

export const DEBOUNCE_DELAY = 175;

export const SUBWORD_MATCHER = /[A-Z]?[a-z]+/g;

export const COLORS = [
  "default",
  "blue",
  "green",
  "red",
  "yellow",
  "purple",
] as const;

export type SymbolColor = typeof COLORS[number];
