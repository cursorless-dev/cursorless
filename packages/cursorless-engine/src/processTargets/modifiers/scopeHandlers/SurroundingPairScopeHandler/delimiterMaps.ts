import type {
  ComplexSurroundingPairName,
  SimpleSurroundingPairName,
} from "@cursorless/common";
import { unsafeKeys } from "@cursorless/common";

type IndividualDelimiterText = string | string[];

interface Options {
  /**
   * If true, then the delimiter pair can only be on a single line. We use this
   * flag to save us searching the entire document when we're trying to
   * determine whether an ambiguous delimiter is opening or closing. The most
   * salient example is strings.
   */
  isSingleLine?: boolean;

  /**
   * The prefixes that can be used before the left side of the delimiter, eg "r"
   */
  prefixes?: string[];
}

type DelimiterMap = Record<
  SimpleSurroundingPairName,
  | [IndividualDelimiterText, IndividualDelimiterText]
  | [IndividualDelimiterText, IndividualDelimiterText, Options]
>;

const delimiterToText: DelimiterMap = Object.freeze({
  angleBrackets: [
    ["</", "<"],
    [">", "/>"],
  ],
  backtickQuotes: ["`", "`"],
  curlyBrackets: [["{", "${"], "}"],
  tripleDoubleQuotes: [[], []],
  tripleSingleQuotes: [[], []],
  doubleQuotes: ['"', '"', { isSingleLine: true }],
  escapedDoubleQuotes: ['\\"', '\\"', { isSingleLine: true }],
  escapedParentheses: ["\\(", "\\)"],
  escapedSquareBrackets: ["\\[", "\\]"],
  escapedSingleQuotes: ["\\'", "\\'", { isSingleLine: true }],
  parentheses: [["(", "$("], ")"],
  singleQuotes: ["'", "'", { isSingleLine: true }],
  squareBrackets: ["[", "]"],
});

// https://docs.python.org/3/reference/lexical_analysis.html#string-and-bytes-literals
const pythonPrefixes = [
  // string prefixes
  "r",
  "u",
  "R",
  "U",
  "f",
  "F",
  "fr",
  "Fr",
  "fR",
  "FR",
  "rf",
  "rF",
  "Rf",
  "RF",
  // byte prefixes
  "b",
  "B",
  "br",
  "Br",
  "bR",
  "BR",
  "rb",
  "rB",
  "Rb",
  "RB",
];

// FIXME: Probably remove these as part of
// https://github.com/cursorless-dev/cursorless/issues/1812#issuecomment-1691493746
const delimiterToTextOverrides: Record<string, Partial<DelimiterMap>> = {
  nix: {
    singleQuotes: ["''", "''"],
  },

  lua: {
    // FIXME: Add special double square brackets
    // see https://github.com/cursorless-dev/cursorless/pull/2012#issuecomment-1808214409
    // see also https://github.com/cursorless-dev/cursorless/issues/1812#issuecomment-1691493746
    doubleQuotes: [
      ['"', "[["],
      ['"', "]]"],
    ],
  },

  python: {
    singleQuotes: ["'", "'", { isSingleLine: true, prefixes: pythonPrefixes }],
    doubleQuotes: ['"', '"', { isSingleLine: true, prefixes: pythonPrefixes }],
    tripleSingleQuotes: ["'''", "'''", { prefixes: pythonPrefixes }],
    tripleDoubleQuotes: ['"""', '"""', { prefixes: pythonPrefixes }],
  },

  ruby: {
    tripleDoubleQuotes: ["%Q(", ")"],
  },
};

export const leftToRightMap: Record<string, string> = Object.fromEntries(
  Object.values(delimiterToText),
);

/**
 * Some surrounding pair scope types are really just shorthand for multiple
 * acceptable delimiters.  This map defines these surrounding pairs.
 */
export const complexDelimiterMap: Record<
  ComplexSurroundingPairName,
  SimpleSurroundingPairName[]
> = {
  any: unsafeKeys(delimiterToText),
  string: [
    "tripleDoubleQuotes",
    "tripleSingleQuotes",
    "doubleQuotes",
    "singleQuotes",
    "backtickQuotes",
  ],
  collectionBoundary: [
    "parentheses",
    "squareBrackets",
    "curlyBrackets",
    "angleBrackets",
  ],
};

/**
 * Given a language id, returns a list of all possible delimiters for that
 * language.
 *
 * Allows us to support languages where the parse tree gives type names to nodes
 * that don't correspond to the actual delimiter.
 *
 * Note that we pass in `undefined` if we are in a text fragment, because then
 * we won't be using a parse tree.
 *
 * FIXME: Probably remove these as part of
 * https://github.com/cursorless-dev/cursorless/issues/1812#issuecomment-1691493746
 *
 * @param languageId The language id, or `undefined` if in a text fragment
 * @returns A list of all possible delimiters for that language
 */
export function getSimpleDelimiterMap(
  languageId: string | undefined,
): Record<
  SimpleSurroundingPairName,
  | [IndividualDelimiterText, IndividualDelimiterText]
  | [IndividualDelimiterText, IndividualDelimiterText, Options]
> {
  if (languageId != null && languageId in delimiterToTextOverrides) {
    return {
      ...delimiterToText,
      ...delimiterToTextOverrides[languageId],
    };
  }

  return delimiterToText;
}
