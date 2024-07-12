import { SpeakableSurroundingPairName } from "@cursorless/common/src/types/SpokenFormType";

export const surroundingPairsDelimiters: Record<
  SpeakableSurroundingPairName,
  [string, string] | null
> = {
  curlyBrackets: ["{", "}"],
  angleBrackets: ["<", ">"],
  escapedDoubleQuotes: ['\\"', '\\"'],
  escapedSingleQuotes: ["\\'", "\\'"],
  escapedParentheses: ["\\(", "\\)"],
  escapedSquareBrackets: ["\\[", "\\]"],
  doubleQuotes: ['"', '"'],
  parentheses: ["(", ")"],
  backtickQuotes: ["`", "`"],
  squareBrackets: ["[", "]"],
  singleQuotes: ["'", "'"],
  whitespace: [" ", " "],

  any: null,
  string: null,
  collectionBoundary: null,
};
