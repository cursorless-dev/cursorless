import type {
  ComplexSurroundingPairName,
  IndividualDelimiterText,
  SimpleSurroundingPairName,
} from "@cursorless/lib-common";
import { pairedDelimiterReferences, unsafeKeys } from "@cursorless/lib-common";

interface Options {
  isSingleLine?: boolean;
}

type DelimiterMap = Record<
  SimpleSurroundingPairName,
  | [IndividualDelimiterText, IndividualDelimiterText]
  | [IndividualDelimiterText, IndividualDelimiterText, Options]
>;

// Note that the order here is important since we are creating a regex from the key order.
// For example triple quotes need to come before single quotes.
const matchingDelimiterMap: DelimiterMap = Object.freeze({
  angleBrackets: getReferenceDelimiterDefinition("angleBrackets"),
  curlyBrackets: getReferenceDelimiterDefinition("curlyBrackets"),
  tripleBacktickQuotes: getReferenceDelimiterDefinition("tripleBacktickQuotes"),
  tripleDoubleQuotes: getReferenceDelimiterDefinition("tripleDoubleQuotes"),
  tripleSingleQuotes: getReferenceDelimiterDefinition("tripleSingleQuotes"),
  doubleQuotes: getReferenceDelimiterDefinition("doubleQuotes"),
  escapedDoubleQuotes: getReferenceDelimiterDefinition("escapedDoubleQuotes"),
  escapedParentheses: getReferenceDelimiterDefinition("escapedParentheses"),
  escapedSquareBrackets: getReferenceDelimiterDefinition(
    "escapedSquareBrackets",
  ),
  escapedSingleQuotes: getReferenceDelimiterDefinition("escapedSingleQuotes"),
  parentheses: getReferenceDelimiterDefinition("parentheses"),
  backtickQuotes: getReferenceDelimiterDefinition("backtickQuotes"),
  singleQuotes: getReferenceDelimiterDefinition("singleQuotes"),
  squareBrackets: getReferenceDelimiterDefinition("squareBrackets"),
});

function getReferenceDelimiterDefinition(
  name: SimpleSurroundingPairName,
): DelimiterMap[SimpleSurroundingPairName] {
  const reference = pairedDelimiterReferences[name];
  const delimiters = reference.matchingDelimiters;

  if (delimiters == null) {
    throw new Error(`No matching delimiters defined for '${name}'`);
  }

  return reference.isSingleLine
    ? [delimiters[0], delimiters[1], { isSingleLine: true }]
    : [delimiters[0], delimiters[1]];
}

// FIXME: Probably remove these as part of
// https://github.com/cursorless-dev/cursorless/issues/1812#issuecomment-1691493746
const matchingDelimiterOverrides: Record<string, Partial<DelimiterMap>> = {
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
    tripleSingleQuotes: ["'''", "'''"],
    tripleDoubleQuotes: ['"""', '"""'],
  },

  markdown: {
    tripleBacktickQuotes: ["```", "```"],
  },

  ruby: {
    doubleQuotes: ['"', '"', { isSingleLine: false }],
    tripleDoubleQuotes: ["%Q(", ")"],
  },

  clojure: {
    doubleQuotes: ['"', '"', { isSingleLine: false }],
  },

  csharp: {
    doubleQuotes: [
      ['@"', '"'],
      ['"', '"'],
    ],
  },
};

export const leftToRightMap: Record<string, string> = Object.fromEntries(
  Object.values(matchingDelimiterMap),
);

/**
 * Some surrounding pair scope types are really just shorthand for multiple
 * acceptable delimiters.  This map defines these surrounding pairs.
 */
export const complexDelimiterMap: Record<
  ComplexSurroundingPairName,
  SimpleSurroundingPairName[]
> = {
  any: unsafeKeys(matchingDelimiterMap),
  string: [
    "tripleDoubleQuotes",
    "tripleSingleQuotes",
    "tripleBacktickQuotes",
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
  if (languageId != null && languageId in matchingDelimiterOverrides) {
    return {
      ...matchingDelimiterMap,
      ...matchingDelimiterOverrides[languageId],
    };
  }

  return matchingDelimiterMap;
}
