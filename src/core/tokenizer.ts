const REPEATABLE_SYMBOLS = [
  "+",
  "-",
  "*",
  "/",
  "=",
  "<",
  ">",
  "_",
  "#",
  ".",
  "|",
  "&",
  ":",
];

const FIXED_TOKENS = [
  "!==",
  "!=",
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
  "<=",
  ">=",
  "=>",
  "->",
  "??",
  '"""',
  "```",
  "\\r",
  "\\n",
  "\\t",
];
const REPEATABLE_SYMBOLS_REGEX = REPEATABLE_SYMBOLS.map(escapeRegExp)
  .map((s) => `${s}+`)
  .join("|");
const FIXED_TOKENS_REGEX = FIXED_TOKENS.map(escapeRegExp).join("|");
const IDENTIFIERS_REGEX = "[\\p{L}_0-9]+";
const SINGLE_SYMBOLS_REGEX = "[^\\s\\w]";
const NUMBERS_REGEX = "(?<=[^.\\d]|^)\\d+\\.\\d+(?=[^.\\d]|$)"; // (not-dot/digit digits dot digits not-dot/digit)

const REGEX = [
  FIXED_TOKENS_REGEX,
  NUMBERS_REGEX,
  IDENTIFIERS_REGEX,
  REPEATABLE_SYMBOLS_REGEX,
  SINGLE_SYMBOLS_REGEX,
].join("|");

export const TOKEN_MATCHER = new RegExp(REGEX, "gu");

export function tokenize<T>(
  text: string,
  mapfn: (v: RegExpMatchArray, k: number) => T
) {
  return Array.from(text.matchAll(TOKEN_MATCHER), mapfn);
}

//https://stackoverflow.com/a/6969486
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
