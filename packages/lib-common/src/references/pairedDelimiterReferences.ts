import type { SpeakableSurroundingPairName } from "../types/SpokenFormType";
import type { SpokenFormReference } from "./ReferenceEntry";

export const pairedDelimiterReferences = {
  curlyBrackets: {
    defaultSpokenForm: "curly",
  },
  angleBrackets: {
    defaultSpokenForm: "diamond",
  },
  escapedDoubleQuotes: {
    defaultSpokenForm: "escaped quad",
  },
  escapedSingleQuotes: {
    defaultSpokenForm: "escaped twin",
  },
  escapedParentheses: {
    defaultSpokenForm: "escaped round",
  },
  escapedSquareBrackets: {
    defaultSpokenForm: "escaped box",
  },
  doubleQuotes: {
    defaultSpokenForm: "quad",
  },
  parentheses: {
    defaultSpokenForm: "round",
  },
  backtickQuotes: {
    defaultSpokenForm: "skis",
  },
  squareBrackets: {
    defaultSpokenForm: "box",
  },
  singleQuotes: {
    defaultSpokenForm: "twin",
  },
  tripleDoubleQuotes: {
    defaultSpokenForm: "triple quad",
    disabledByDefault: true,
    private: true,
  },
  tripleSingleQuotes: {
    defaultSpokenForm: "triple twin",
    disabledByDefault: true,
    private: true,
  },
  tripleBacktickQuotes: {
    defaultSpokenForm: "triple skis",
    disabledByDefault: true,
    private: true,
  },
  any: {
    defaultSpokenForm: "pair",
  },
  string: {
    defaultSpokenForm: "string",
  },
  whitespace: {
    defaultSpokenForm: "void",
  },
  collectionBoundary: {
    defaultSpokenForm: "collection boundary",
    disabledByDefault: true,
    private: true,
  },
} satisfies Record<SpeakableSurroundingPairName, SpokenFormReference>;
