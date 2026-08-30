import type { SpeakableSurroundingPairName } from "../types/SpokenFormType";
import type { SpokenFormReference } from "./ReferenceEntry";

export interface PairedDelimiterReference extends SpokenFormReference {
  name: string;
  defaultSpokenForm: string;
  delimiters: readonly [string, string] | null;
  selectable: boolean;
  referenceIndex: number | null;
}

export const pairedDelimiterReferences = {
  curlyBrackets: {
    name: "curly brackets",
    defaultSpokenForm: "curly",
    delimiters: ["{", "}"],
    selectable: true,
    referenceIndex: 4,
  },
  angleBrackets: {
    name: "angle brackets",
    defaultSpokenForm: "diamond",
    delimiters: ["<", ">"],
    selectable: true,
    referenceIndex: 6,
  },
  escapedDoubleQuotes: {
    name: "escaped double quotes",
    defaultSpokenForm: "escaped quad",
    delimiters: [String.raw`\"`, String.raw`\"`],
    selectable: true,
    referenceIndex: 7,
  },
  escapedSingleQuotes: {
    name: "escaped single quotes",
    defaultSpokenForm: "escaped twin",
    delimiters: [String.raw`\'`, String.raw`\'`],
    selectable: true,
    referenceIndex: 8,
  },
  escapedParentheses: {
    name: "escaped parentheses",
    defaultSpokenForm: "escaped round",
    delimiters: [String.raw`\(`, String.raw`\)`],
    selectable: true,
    referenceIndex: 9,
  },
  escapedSquareBrackets: {
    name: "escaped square brackets",
    defaultSpokenForm: "escaped box",
    delimiters: [String.raw`\[`, String.raw`\]`],
    selectable: true,
    referenceIndex: null,
  },
  doubleQuotes: {
    name: "double quotes",
    defaultSpokenForm: "quad",
    delimiters: ['"', '"'],
    selectable: true,
    referenceIndex: 0,
  },
  parentheses: {
    name: "parentheses",
    defaultSpokenForm: "round",
    delimiters: ["(", ")"],
    selectable: true,
    referenceIndex: 3,
  },
  backtickQuotes: {
    name: "backtick quotes",
    defaultSpokenForm: "skis",
    delimiters: ["`", "`"],
    selectable: true,
    referenceIndex: 2,
  },
  squareBrackets: {
    name: "square brackets",
    defaultSpokenForm: "box",
    delimiters: ["[", "]"],
    selectable: true,
    referenceIndex: 5,
  },
  singleQuotes: {
    name: "single quotes",
    defaultSpokenForm: "twin",
    delimiters: ["'", "'"],
    selectable: true,
    referenceIndex: 1,
  },
  tripleDoubleQuotes: {
    name: "triple double quotes",
    defaultSpokenForm: "triple quad",
    delimiters: ['"""', '"""'],
    selectable: true,
    referenceIndex: null,
    disabledByDefault: true,
    private: true,
  },
  tripleSingleQuotes: {
    name: "triple single quotes",
    defaultSpokenForm: "triple twin",
    delimiters: ["'''", "'''"],
    selectable: true,
    referenceIndex: null,
    disabledByDefault: true,
    private: true,
  },
  tripleBacktickQuotes: {
    name: "triple backtick quotes",
    defaultSpokenForm: "triple skis",
    delimiters: ["```", "```"],
    selectable: true,
    referenceIndex: null,
    disabledByDefault: true,
    private: true,
  },
  any: {
    name: "any",
    defaultSpokenForm: "pair",
    delimiters: null,
    selectable: true,
    referenceIndex: 11,
  },
  string: {
    name: "string",
    defaultSpokenForm: "string",
    delimiters: null,
    selectable: true,
    referenceIndex: null,
  },
  whitespace: {
    name: "space",
    defaultSpokenForm: "void",
    delimiters: [" ", " "],
    selectable: false,
    referenceIndex: 10,
  },
  collectionBoundary: {
    name: "collection boundary",
    defaultSpokenForm: "collection boundary",
    delimiters: null,
    selectable: true,
    referenceIndex: null,
    disabledByDefault: true,
    private: true,
  },
} satisfies Record<SpeakableSurroundingPairName, PairedDelimiterReference>;
