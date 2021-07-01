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
];

const FIXED_TOKENS = ["!==", "!=", "+=", "-=", "*=", "/=", "%=", "<=", ">="];
const REPEATABLE_SYMBOLS_REGEX = REPEATABLE_SYMBOLS.map(escapeRegExp)
  .map((s) => `${s}+`)
  .join("|");
const FIXED_TOKENS_REGEX = FIXED_TOKENS.map(escapeRegExp).join("|");
const IDENTIFIERS_REGEX = "[a-zA-Z_]+[a-zA-Z_0-9]*";
const SINGLE_SYMBOLS_REGEX = "[^\\s\\w]";
const NUMBERS_REGEX = "(?<=[^.\\d])\\d+\\.\\d+(?=[^.\\d])|\\d+"; // (not-dot/digit digits dot digits not-dot/digit) OR digits

const REGEX = [
  IDENTIFIERS_REGEX,
  FIXED_TOKENS_REGEX,
  REPEATABLE_SYMBOLS_REGEX,
  NUMBERS_REGEX,
  SINGLE_SYMBOLS_REGEX,
].join("|");

const TOKEN_MATCHER = new RegExp(REGEX, "g");

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
