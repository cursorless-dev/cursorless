import {
  ComplexSurroundingPairName,
  SimpleSurroundingPairName,
} from "@cursorless/common";
import { unsafeKeys } from "../../../../util/object";

type IndividualDelimiterText = string | string[];

export const delimiterToText: Record<
  SimpleSurroundingPairName,
  [IndividualDelimiterText, IndividualDelimiterText]
> = Object.freeze({
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
