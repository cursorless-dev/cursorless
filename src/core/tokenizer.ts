import { SupportedLanguageId } from "../languages/constants";
import { DefaultLanguageTokenizer as DefaultLanguageTokenizerSettings } from "../typings/Types";
import { matchAll } from "../util/regex";
import css from "./languageTokenizers/css";

export const REPEATABLE_SYMBOLS = [
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

export const FIXED_TOKENS = [
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
export const REPEATABLE_SYMBOLS_REGEX = REPEATABLE_SYMBOLS.map(escapeRegExp)
  .map((s) => `${s}+`)
  .join("|");
export const FIXED_TOKENS_REGEX = FIXED_TOKENS.map(escapeRegExp).join("|");
export const IDENTIFIERS_REGEX = "[\\p{L}(_|\\-)0-9]+";
export const SINGLE_SYMBOLS_REGEX = "[^\\s\\w\\-]";
export const NUMBERS_REGEX = "(?<=[^.\\d]|^)\\d+\\.\\d+(?=[^.\\d]|$)"; // (not-dot/digit digits dot digits not-dot/digit)

const defaultLanguageTokenizerSetting: DefaultLanguageTokenizerSettings = {
  fixedTokens: FIXED_TOKENS,
  repeatableSymbols: REPEATABLE_SYMBOLS,
  identifiersRegex: IDENTIFIERS_REGEX,
  numbersRegex: NUMBERS_REGEX,
  singleSymbolsRegex: SINGLE_SYMBOLS_REGEX,
};

export const TOKEN_MATCHER = generateTokenMatcher(
  defaultLanguageTokenizerSetting
);

function generateTokenMatcher(
  defaultLanguageTokenizerSetting: DefaultLanguageTokenizerSettings,
  languageId?: SupportedLanguageId
): RegExp {
  let settings = {};
  if (languageId && languageSettings[languageId]) {
    settings = languageSettings[languageId] ?? {};
  }

  const tokenizerDefinition = Object.assign(
    defaultLanguageTokenizerSetting,
    settings
  );

  tokenizerDefinition.repeatableSymbolsRegex =
    tokenizerDefinition.repeatableSymbols
      .map(escapeRegExp)
      .map((s) => `${s}+`)
      .join("|");

  tokenizerDefinition.fixedTokensRegex = tokenizerDefinition.fixedTokens
    .map(escapeRegExp)
    .join("|");

  const regex = Object.entries(tokenizerDefinition)
    .filter(
      ([key, _value]) => key !== "fixedTokens" && key !== "repeatableSymbols"
    )
    .flatMap((entry) => entry.values)
    .join("|");
  return new RegExp(regex, "gu");
}

const languageSettings: Partial<
  Record<SupportedLanguageId, Partial<DefaultLanguageTokenizerSettings>>
> = {
  css,
};

const tokenMatchersForLanguage: Partial<Record<SupportedLanguageId, RegExp>> = {
  css: TOKEN_MATCHER,
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
  languageId: SupportedLanguageId,
  mapfn: (v: RegExpMatchArray, k: number) => T
) {
  return matchAll(text, getTokenMatcher(languageId), mapfn);
}

//https://stackoverflow.com/a/6969486
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
