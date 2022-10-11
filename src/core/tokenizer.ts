import { mapValues } from "lodash";
import { LanguageId, SupportedLanguageId } from "../languages/constants";

import { matchAll } from "../util/regex";
import { languageWithDashedIdentifiers } from "./languageTokenizers";
import {
  LanguageTokenizerComponents,
  LanguageTokenizerOverrides,
} from "./tokenizer.types";

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
  "/*",
  "*/",
  "<!--",
  "-->",
];

export const LETTERS_NUMBERS = "\\p{L}\\p{M}\\d";
const DELIMITERS = "_";
const IDENTIFIERS_REGEX = `[${LETTERS_NUMBERS}${DELIMITERS}]+`;
export const IDENTIFIERS_WORD_REGEX = new RegExp(`[${LETTERS_NUMBERS}]+`, "gu");
const SINGLE_SYMBOLS_REGEX = "[^\\s\\w]";
const NUMBERS_REGEX = "(?<=[^.\\d]|^)\\d+\\.\\d+(?=[^.\\d]|$)"; // (not-dot/digit digits dot digits not-dot/digit)

const defaultLanguageTokenizerComponents: LanguageTokenizerComponents = {
  fixedTokens: FIXED_TOKENS,
  repeatableSymbols: REPEATABLE_SYMBOLS,
  identifiersRegex: IDENTIFIERS_REGEX,
  numbersRegex: NUMBERS_REGEX,
  singleSymbolsRegex: SINGLE_SYMBOLS_REGEX,
};

const defaultTokenMatcher = generateTokenMatcher();

function generateTokenMatcher(
  languageOverrides: LanguageTokenizerOverrides = {}
): RegExp {
  const {
    fixedTokens,
    repeatableSymbols,
    identifiersRegex,
    numbersRegex,
    singleSymbolsRegex,
  }: LanguageTokenizerComponents = {
    ...defaultLanguageTokenizerComponents,
    ...languageOverrides,
  };

  const repeatableSymbolsRegex = repeatableSymbols
    .map(escapeRegExp)
    .map((s) => `${s}+`)
    .join("|");

  const fixedTokensRegex = fixedTokens.map(escapeRegExp).join("|");

  // Order matters here.
  const regex = [
    fixedTokensRegex,
    numbersRegex,
    identifiersRegex,
    repeatableSymbolsRegex,
    singleSymbolsRegex,
  ].join("|");

  return new RegExp(regex, "gu");
}

const languageTokenizerOverrides: Partial<
  Record<LanguageId, LanguageTokenizerOverrides>
> = {
  css: languageWithDashedIdentifiers,
  scss: languageWithDashedIdentifiers,
  shellscript: languageWithDashedIdentifiers,
};

const tokenMatchersForLanguage: Partial<Record<LanguageId, RegExp>> = mapValues(
  languageTokenizerOverrides,
  (val: LanguageTokenizerComponents) => generateTokenMatcher(val)
);

export function getTokenMatcher(languageId: string): RegExp {
  return (
    tokenMatchersForLanguage[languageId as SupportedLanguageId] ??
    defaultTokenMatcher
  );
}

export function getIdentifierMatcher(languageId?: string): RegExp {
  const regex =
    languageTokenizerOverrides[languageId as SupportedLanguageId]
      ?.identifiersRegex ?? IDENTIFIERS_REGEX;
  return new RegExp(regex, "gu");
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
