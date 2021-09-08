export type PairDelimiter =
  | "angleBrackets"
  | "backtickQuotes"
  | "curlyBrackets"
  | "doubleQuotes"
  | "escapedSingleQuotes"
  | "escapedDoubleQuotes"
  | "parentheses"
  | "singleQuotes"
  | "squareBrackets"
  | "whitespace";

export const pairDelimiterToText: Record<PairDelimiter, string[]> = {
  angleBrackets: ["<", ">"],
  backtickQuotes: ["`", "`"],
  curlyBrackets: ["{", "}"],
  doubleQuotes: ['"', '"'],
  escapedDoubleQuotes: ['\\"', '\\"'],
  escapedSingleQuotes: ["\\'", "\\'"],
  parentheses: ["(", ")"],
  singleQuotes: ["'", "'"],
  squareBrackets: ["[", "]"],
  whitespace: [" ", " "], // TODO: Fix this to handle tabs / newlines
};
