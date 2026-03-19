import type { SpeakableSurroundingPairName } from "@cursorless/lib-common";

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
  tripleBacktickQuotes: ["```", "```"],
  tripleDoubleQuotes: ['"""', '"""'],
  tripleSingleQuotes: ["'''", "'''"],
  whitespace: [" ", " "],

  any: null,
  string: null,
  collectionBoundary: null,
};
