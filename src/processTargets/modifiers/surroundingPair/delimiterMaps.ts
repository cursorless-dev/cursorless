import {
  ComplexSurroundingPairName,
  SimpleSurroundingPairName,
} from "../../../typings/Types";

type IndividualDelimiterText = string | string[];

export const delimiterToText: Record<
  SimpleSurroundingPairName,
  [IndividualDelimiterText, IndividualDelimiterText]
> = {
  angleBrackets: ["<", ">"],
  backtickQuotes: ["`", "`"],
  curlyBrackets: [["{", "${"], "}"],
  doubleQuotes: ['"', '"'],
  escapedDoubleQuotes: ['\\"', '\\"'],
  escapedParentheses: ["\\(", "\\)"],
  escapedSingleQuotes: ["\\'", "\\'"],
  parentheses: ["(", ")"],
  singleQuotes: ["'", "'"],
  squareBrackets: ["[", "]"],
};

export const leftToRightMap: Record<string, string> = Object.fromEntries(
  Object.values(delimiterToText)
);

/**
 * Delimiters to look for when the user does not specify a delimiter
 */
export const complexDelimiterMap: Record<
  ComplexSurroundingPairName,
  SimpleSurroundingPairName[]
> = {
  any: Object.keys(delimiterToText),
  string: ["singleQuotes", "doubleQuotes", "backtickQuotes"],
};
