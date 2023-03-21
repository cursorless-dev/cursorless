import {
  ComplexSurroundingPairName,
  SimpleSurroundingPairName,
} from "@cursorless/common";

type IndividualDelimiterText = string | string[];

export const delimiterToText: Record<
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
