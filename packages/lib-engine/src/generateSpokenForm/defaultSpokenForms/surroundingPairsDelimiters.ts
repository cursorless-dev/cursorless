import type { SpeakableSurroundingPairName } from "@cursorless/lib-common";

export const surroundingPairsDelimiters: Record<
  SpeakableSurroundingPairName,
  [string, string] | null
> = {
  curlyBrackets: ["{", "}"],
  angleBrackets: ["<", ">"],
  escapedDoubleQuotes: [String.raw`\"`, String.raw`\"`],
  escapedSingleQuotes: [String.raw`\'`, String.raw`\'`],
  escapedParentheses: [String.raw`\(`, String.raw`\)`],
  escapedSquareBrackets: [String.raw`\[`, String.raw`\]`],
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
