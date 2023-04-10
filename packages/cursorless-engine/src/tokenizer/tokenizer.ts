import { escapeRegExp } from "lodash";
import { ide } from "../singletons/ide.singleton";
import { matchAll } from "../util/regex";
import { LanguageTokenizerComponents } from "./tokenizer.types";

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
const SINGLE_SYMBOLS_REGEX = "[^\\s\\w]";
// Accepts digits dot digits if not preceded or followed by a digit or dot. The
// negative lookahed / lookbehind are to prevent matching numbers in semantic
// versions (eg 1.2.3)
const NUMBERS_REGEX = "(?<![.\\d])\\d+\\.\\d+(?![.\\d])";

interface Matcher {
  tokenMatcher: RegExp;
  identifierMatcher: RegExp;
  wordMatcher: RegExp;
}

function generateMatcher(languageComponents: LanguageTokenizerComponents): Matcher {
  const {
    fixedTokens,
    repeatableSymbols,
    identifierWordRegexes,
    identifierWordDelimiters,
    numbersRegex,
    singleSymbolsRegex,
  } = languageComponents;

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

const matchers = new Map<string, Matcher>();

export function getMatcher(languageId: string): Matcher {
  // FIXME: The reason this code will auto-reload on settings change is that we don't use fine-grained settings listener in `Decorations`:
  // https://github.com/cursorless-dev/cursorless/blob/c914d477c9624c498a47c964088b34e484eac494/src/core/Decorations.ts#L58
  const wordSeparators = ide().configuration.getOwnConfiguration("wordSeparators", {
    languageId,
  });

  const key = wordSeparators.join("\u0000");

  if (!matchers.has(key)) {
    const components: LanguageTokenizerComponents = {
      fixedTokens: FIXED_TOKENS,
      repeatableSymbols: REPEATABLE_SYMBOLS,
      identifierWordRegexes: IDENTIFIER_WORD_REGEXES,
      identifierWordDelimiters: wordSeparators,
      numbersRegex: NUMBERS_REGEX,
      singleSymbolsRegex: SINGLE_SYMBOLS_REGEX,
    };
    matchers.set(key, generateMatcher(components));
  }

  return matchers.get(key)!;
}

export function tokenize<T>(
  text: string,
  languageId: string,
  mapfn: (v: RegExpMatchArray, k: number) => T,
) {
  return matchAll(text, getMatcher(languageId).tokenMatcher, mapfn);
}
