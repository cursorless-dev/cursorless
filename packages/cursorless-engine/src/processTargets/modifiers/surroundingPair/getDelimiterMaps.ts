import {
  ComplexSurroundingPairName,
  SimpleSurroundingPairName,
} from "@cursorless/common";

type IndividualDelimiterText = string | string[];

const delimiterToText: Record<
  SimpleSurroundingPairName,
  [IndividualDelimiterText, IndividualDelimiterText]
> = {
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
};

const delimiterToTextNix: Record<
  SimpleSurroundingPairName,
  [IndividualDelimiterText, IndividualDelimiterText]
> = {
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
  singleQuotes: ["''", "''"],
  squareBrackets: ["[", "]"],
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
  any: Object.keys(delimiterToText),
  string: ["singleQuotes", "doubleQuotes", "backtickQuotes"],
  collectionBoundary: [
    "parentheses",
    "squareBrackets",
    "curlyBrackets",
    "angleBrackets",
  ],
};

/**
 * Given a language id, returns a list of all possible delimiters
 * for that language.
 * @param languageId The language id
 * @returns A list of all possible delimiters for that language
 */
export function getSimpleDelimiterMap(
  languageId: string,
): Record<
  SimpleSurroundingPairName,
  [IndividualDelimiterText, IndividualDelimiterText]
> {
  if (languageId == "nix") {
    return delimiterToTextNix;
  } else {
    return delimiterToText;
  }
}
