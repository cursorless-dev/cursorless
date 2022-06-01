import { SupportedLanguageId } from "../languages/constants";
import { DefaultLanguageTokenizer as DefaultLanguageTokenizerSettings } from "../typings/Types";
import { matchAll } from "../util/regex";
import css from "./languageTokenizers/css";

const REPEATABLE_SYMBOLS = [
  "-",
  "+",
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
  "/*",
  "*/",
  "<!--",
  "-->",
];

const IDENTIFIERS_REGEX = "[\\p{L}_0-9]+";
const SINGLE_SYMBOLS_REGEX = "[^\\s\\w]";
const NUMBERS_REGEX = "(?<=[^.\\d]|^)\\d+\\.\\d+(?=[^.\\d]|$)"; // (not-dot/digit digits dot digits not-dot/digit)

const defaultLanguageTokenizerSetting: DefaultLanguageTokenizerSettings = {
  fixedTokens: FIXED_TOKENS,
  repeatableSymbols: REPEATABLE_SYMBOLS,
  identifiersRegex: IDENTIFIERS_REGEX,
  numbersRegex: NUMBERS_REGEX,
  singleSymbolsRegex: SINGLE_SYMBOLS_REGEX,
};

export const TOKEN_MATCHER = generateTokenMatcher();

function generateTokenMatcher(languageId?: SupportedLanguageId): RegExp {
  let settings = {};
  if (languageId && languageSettings[languageId]) {
    settings = languageSettings[languageId] ?? {};
  }

  const tokenizerDefinition = Object.assign(
    defaultLanguageTokenizerSetting,
    settings
  );

  const repeatableSymbolsRegex = tokenizerDefinition.repeatableSymbols
    .map(escapeRegExp)
    .map((s) => `${s}+`)
    .join("|");

  const fixedTokensRegex = tokenizerDefinition.fixedTokens
    .map(escapeRegExp)
    .join("|");

  // Order matters here.
  const regex = [
    fixedTokensRegex,
    tokenizerDefinition.numbersRegex,
    tokenizerDefinition.identifiersRegex,
    repeatableSymbolsRegex,
    tokenizerDefinition.singleSymbolsRegex,
  ].join("|");
  console.log("lang:", languageId, regex);
  return new RegExp(regex, "gu");
}

const languageSettings: Partial<
  Record<SupportedLanguageId, Partial<DefaultLanguageTokenizerSettings>>
> = {
  css,
};

const tokenMatchersForLanguage: Partial<Record<SupportedLanguageId, RegExp>> = {
  css: generateTokenMatcher("css"),
  scss: generateTokenMatcher("css"),
};

export function getTokenMatcher(languageId: string): RegExp {
  const languageMatcher =
    tokenMatchersForLanguage[languageId as SupportedLanguageId];
  if (languageMatcher) {
    return languageMatcher;
  }
  return TOKEN_MATCHER;
}

export function tokenize<T>(
  text: string,
  languageId: string,
  mapfn: (v: RegExpMatchArray, k: number) => T
) {
  return matchAll(text, getTokenMatcher(languageId), mapfn);
}

//https://stackoverflow.com/a/6969486
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
