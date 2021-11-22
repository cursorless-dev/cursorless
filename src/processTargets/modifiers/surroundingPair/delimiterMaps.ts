import { SurroundingPairName } from "../../../typings/Types";

type IndividualDelimiterText = string | string[];

export const delimiterToText: Record<
  SurroundingPairName,
  [IndividualDelimiterText, IndividualDelimiterText]
> = {
  squareBrackets: ["[", "]"],
  curlyBrackets: [["{", "${"], "}"],
  angleBrackets: ["<", ">"],
  parentheses: ["(", ")"],
  singleQuotes: ["'", "'"],
  doubleQuotes: ['"', '"'],
  backtickQuotes: ["`", "`"],
  escapedSingleQuotes: ["\\'", "\\'"],
  escapedDoubleQuotes: ['\\"', '\\"'],
  escapedParentheses: ["\\(", "\\)"],
};

export const leftToRightMap: Record<string, string> = Object.fromEntries(
  Object.values(delimiterToText)
);

/**
 * Delimiters to look for when the user does not specify a delimiter
 */
export const anyDelimiter = Object.keys(delimiterToText);
