import {
  ComplexSurroundingPairName,
  SimpleSurroundingPairName,
} from "@cursorless/common";
import { unsafeKeys } from "../../../util/object";

type IndividualDelimiterText = string | string[];

type DelimiterMap = Record<
  SimpleSurroundingPairName,
  [IndividualDelimiterText, IndividualDelimiterText]
>;

const delimiterToText: DelimiterMap = Object.freeze({
  angleBrackets: [
    ["</", "<"],
    [">", "/>"],
  ],
  backtickQuotes: ["`", "`"],
  curlyBrackets: [["{", "${"], "}"],
  doubleQuotes: ['"', '"'],
  escapedDoubleQuotes: ['\\"', '\\"'],
  escapedParentheses: ["\\(", "\\)"],
  escapedSquareBrackets: ["\\[", "\\]"],
  escapedSingleQuotes: ["\\'", "\\'"],
  parentheses: [["(", "$("], ")"],
  singleQuotes: ["'", "'"],
  squareBrackets: ["[", "]"],
});

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
    // FIXME: We technically can't distinguish between single and double quotes
    // now, but we'll revisit all this; see
    // https://github.com/cursorless-dev/cursorless/issues/1812#issuecomment-1691493746
    singleQuotes: ["string_start", "string_end"],
    doubleQuotes: ["string_start", "string_end"],
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
  string: ["singleQuotes", "doubleQuotes", "backtickQuotes"],
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
  [IndividualDelimiterText, IndividualDelimiterText]
> {
  if (languageId != null && languageId in delimiterToTextOverrides) {
    return {
      ...delimiterToText,
      ...delimiterToTextOverrides[languageId],
    };
  }

  return delimiterToText;
}
