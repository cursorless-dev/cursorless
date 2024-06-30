import { SpeakableSurroundingPairName } from "../../spokenForms/SpokenFormType";

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
  tripleDoubleQuotes: ['"""', '"""'],
  tripleSingleQuotes: ["'''", "'''"],
  whitespace: [" ", " "],

  any: null,
  string: null,
  collectionBoundary: null,
};
