import type {
  ComplexSurroundingPairName,
  IndividualDelimiterText,
  PairedDelimiterReference,
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

const matchingDelimiterMap = getMatchingDelimiterMap(undefined);
const matchingDelimiterMapCache = new Map<string, DelimiterMap>();

function getMatchingDelimiterMap(languageId: string | undefined): DelimiterMap {
  const getDefinition = (name: SimpleSurroundingPairName) =>
    getReferenceDelimiterDefinition(name, languageId);

  // Note that the order here is important since we are creating a regex from the key order.
  // For example triple quotes need to come before single quotes.
  return Object.freeze({
    angleBrackets: getDefinition("angleBrackets"),
    curlyBrackets: getDefinition("curlyBrackets"),
    tripleBacktickQuotes: getDefinition("tripleBacktickQuotes"),
    tripleDoubleQuotes: getDefinition("tripleDoubleQuotes"),
    tripleSingleQuotes: getDefinition("tripleSingleQuotes"),
    doubleQuotes: getDefinition("doubleQuotes"),
    escapedDoubleQuotes: getDefinition("escapedDoubleQuotes"),
    escapedParentheses: getDefinition("escapedParentheses"),
    escapedSquareBrackets: getDefinition("escapedSquareBrackets"),
    escapedSingleQuotes: getDefinition("escapedSingleQuotes"),
    parentheses: getDefinition("parentheses"),
    backtickQuotes: getDefinition("backtickQuotes"),
    singleQuotes: getDefinition("singleQuotes"),
    squareBrackets: getDefinition("squareBrackets"),
  });
}

function getReferenceDelimiterDefinition(
  name: SimpleSurroundingPairName,
  languageId: string | undefined,
): DelimiterMap[SimpleSurroundingPairName] {
  const reference: PairedDelimiterReference = pairedDelimiterReferences[name];
  const languageOverride =
    languageId == null ? undefined : reference.languageOverrides?.[languageId];
  const delimiters =
    languageOverride?.matchingDelimiters ?? reference.matchingDelimiters;

  if (delimiters == null) {
    throw new Error(`No matching delimiters defined for '${name}'`);
  }

  const isSingleLine = languageOverride?.isSingleLine ?? reference.isSingleLine;

  return isSingleLine
    ? [delimiters[0], delimiters[1], { isSingleLine: true }]
    : [delimiters[0], delimiters[1]];
}

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
  if (languageId == null) {
    return matchingDelimiterMap;
  }

  let result = matchingDelimiterMapCache.get(languageId);

  if (result == null) {
    result = getMatchingDelimiterMap(languageId);
    matchingDelimiterMapCache.set(languageId, result);
  }

  return result;
}
