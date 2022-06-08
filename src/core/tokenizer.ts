import { mapValues } from "lodash";
import { SupportedLanguageId } from "../languages/constants";
import { LanguageTokenizerComponents } from "../typings/Types";
import { matchAll } from "../util/regex";
import css from "./languageTokenizers/css";
import { default as scss } from "./languageTokenizers/css";

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

const defaultLanguageTokenizerSetting: LanguageTokenizerComponents = {
  fixedTokens: FIXED_TOKENS,
  repeatableSymbols: REPEATABLE_SYMBOLS,
  identifiersRegex: IDENTIFIERS_REGEX,
  numbersRegex: NUMBERS_REGEX,
  singleSymbolsRegex: SINGLE_SYMBOLS_REGEX,
};

const defaultTokenMatcher = generateTokenMatcher();

function generateTokenMatcher(
  languageSetting: LanguageTokenizerComponents = defaultLanguageTokenizerSetting
): RegExp {
  const tokenizerDefinition = Object.assign(
    { ...defaultLanguageTokenizerSetting },
    languageSetting
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
  return new RegExp(regex, "gu");
}

const tokenMatchersForLanguage: Partial<Record<SupportedLanguageId, RegExp>> =
  mapValues({ css, scss }, (val: LanguageTokenizerComponents) =>
    generateTokenMatcher(val)
  );

export function getTokenMatcher(languageId: string): RegExp {
  return (
    tokenMatchersForLanguage[languageId as SupportedLanguageId] ??
    defaultTokenMatcher
  );
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
