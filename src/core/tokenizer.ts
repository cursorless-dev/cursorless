import { escapeRegExp, mapValues } from "lodash";
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

export const IDENTIFIER_WORD_REGEXES = ["\\p{L}", "\\p{M}", "\\p{N}"];
const IDENTIFIER_WORD_DELIMITERS = ["_"];
const SINGLE_SYMBOLS_REGEX = "[^\\s\\w]";
const NUMBERS_REGEX = "(?<=[^.\\d]|^)\\d+\\.\\d+(?=[^.\\d]|$)"; // (not-dot/digit digits dot digits not-dot/digit)

const defaultLanguageTokenizerComponents: LanguageTokenizerComponents = {
  fixedTokens: FIXED_TOKENS,
  repeatableSymbols: REPEATABLE_SYMBOLS,
  identifierWordRegexes: IDENTIFIER_WORD_REGEXES,
  identifierWordDelimiters: IDENTIFIER_WORD_DELIMITERS,
  numbersRegex: NUMBERS_REGEX,
  singleSymbolsRegex: SINGLE_SYMBOLS_REGEX,
};
interface Matcher {
  tokenMatcher: RegExp;
  identifierMatcher: RegExp;
  wordMatcher: RegExp;
}
const defaultMatcher = generateMatcher();

function generateMatcher(
  languageOverrides: LanguageTokenizerOverrides = {},
): Matcher {
  const {
    fixedTokens,
    repeatableSymbols,
    identifierWordRegexes,
    identifierWordDelimiters,
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

  const identifierComponents = identifierWordRegexes.concat(
    identifierWordDelimiters.map(escapeRegExp),
  );
  const identifiersRegex = `(${identifierComponents.join("|")})+`;
  const wordRegex = `(${identifierWordRegexes.join("|")})+`;

  // Order matters here.
  const regex = [
    fixedTokensRegex,
    numbersRegex,
    identifiersRegex,
    repeatableSymbolsRegex,
    singleSymbolsRegex,
  ].join("|");

  return {
    identifierMatcher: new RegExp(identifiersRegex, "gu"),
    wordMatcher: new RegExp(wordRegex, "gu"),
    tokenMatcher: new RegExp(regex, "gu"),
  };
}

const languageTokenizerOverrides: Partial<
  Record<LanguageId, LanguageTokenizerOverrides>
> = {
  css: languageWithDashedIdentifiers,
  scss: languageWithDashedIdentifiers,
  shellscript: languageWithDashedIdentifiers,
};

const tokenMatchersForLanguage: Partial<Record<LanguageId, Matcher>> =
  mapValues(languageTokenizerOverrides, (val: LanguageTokenizerComponents) =>
    generateMatcher(val),
  );

export function getMatcher(languageId: string): Matcher {
  return (
    tokenMatchersForLanguage[languageId as SupportedLanguageId] ??
    defaultMatcher
  );
}

export function tokenize<T>(
  text: string,
  languageId: string,
  mapfn: (v: RegExpMatchArray, k: number) => T,
) {
  return matchAll(text, getMatcher(languageId).tokenMatcher, mapfn);
}
