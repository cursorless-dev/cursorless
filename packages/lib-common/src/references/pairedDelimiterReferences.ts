import type { SpeakableSurroundingPairName } from "../types/SpokenFormType";
import type { SpokenFormReference } from "./ReferenceEntry";

export type IndividualDelimiterText = string | string[];

export interface PairedDelimiterLanguageOverride {
  matchingDelimiters?: readonly [
    IndividualDelimiterText,
    IndividualDelimiterText,
  ];
  isSingleLine?: boolean;
}

export interface PairedDelimiterReference extends SpokenFormReference {
  name: string;
  defaultSpokenForm: string;
  selectable: boolean;
  referenceIndex: number | null;

  /** The canonical delimiters used when inserting a surrounding pair. */
  delimiters: readonly [string, string] | null;

  /** The delimiters recognized when finding a surrounding pair. */
  matchingDelimiters:
    | readonly [IndividualDelimiterText, IndividualDelimiterText]
    | null;

  /** Whether both delimiters must occur on the same line. */
  isSingleLine: boolean;

  /** Language-specific overrides for matching behavior. */
  languageOverrides?: Readonly<Record<string, PairedDelimiterLanguageOverride>>;
}

export const pairedDelimiterReferences = {
  curlyBrackets: {
    name: "curly brackets",
    defaultSpokenForm: "curly",
    delimiters: ["{", "}"],
    matchingDelimiters: [["{", "${"], "}"],
    isSingleLine: false,
    selectable: true,
    referenceIndex: 4,
  },
  angleBrackets: {
    name: "angle brackets",
    defaultSpokenForm: "diamond",
    delimiters: ["<", ">"],
    matchingDelimiters: [
      ["</", "<"],
      [">", "/>"],
    ],
    isSingleLine: false,
    selectable: true,
    referenceIndex: 6,
  },
  escapedDoubleQuotes: {
    name: "escaped double quotes",
    defaultSpokenForm: "escaped quad",
    delimiters: [String.raw`\"`, String.raw`\"`],
    matchingDelimiters: [String.raw`\"`, String.raw`\"`],
    isSingleLine: true,
    selectable: true,
    referenceIndex: 7,
  },
  escapedSingleQuotes: {
    name: "escaped single quotes",
    defaultSpokenForm: "escaped twin",
    delimiters: [String.raw`\'`, String.raw`\'`],
    matchingDelimiters: [String.raw`\'`, String.raw`\'`],
    isSingleLine: true,
    selectable: true,
    referenceIndex: 8,
  },
  escapedParentheses: {
    name: "escaped parentheses",
    defaultSpokenForm: "escaped round",
    delimiters: [String.raw`\(`, String.raw`\)`],
    matchingDelimiters: [String.raw`\(`, String.raw`\)`],
    isSingleLine: false,
    selectable: true,
    referenceIndex: 9,
  },
  escapedSquareBrackets: {
    name: "escaped square brackets",
    defaultSpokenForm: "escaped box",
    delimiters: [String.raw`\[`, String.raw`\]`],
    matchingDelimiters: [String.raw`\[`, String.raw`\]`],
    isSingleLine: false,
    selectable: true,
    referenceIndex: null,
  },
  doubleQuotes: {
    name: "double quotes",
    defaultSpokenForm: "quad",
    delimiters: ['"', '"'],
    matchingDelimiters: ['"', '"'],
    isSingleLine: true,
    languageOverrides: {
      lua: {
        // FIXME: Add special double square brackets
        // see https://github.com/cursorless-dev/cursorless/pull/2012#issuecomment-1808214409
        // see also https://github.com/cursorless-dev/cursorless/issues/1812#issuecomment-1691493746
        matchingDelimiters: [
          ['"', "[["],
          ['"', "]]"],
        ],
        isSingleLine: false,
      },
      ruby: {
        isSingleLine: false,
      },
      clojure: {
        isSingleLine: false,
      },
      csharp: {
        matchingDelimiters: [
          ['@"', '"'],
          ['"', '"'],
        ],
        isSingleLine: false,
      },
    },
    selectable: true,
    referenceIndex: 0,
  },
  parentheses: {
    name: "parentheses",
    defaultSpokenForm: "round",
    delimiters: ["(", ")"],
    matchingDelimiters: [["(", "$("], ")"],
    isSingleLine: false,
    selectable: true,
    referenceIndex: 3,
  },
  backtickQuotes: {
    name: "backtick quotes",
    defaultSpokenForm: "skis",
    delimiters: ["`", "`"],
    matchingDelimiters: ["`", "`"],
    isSingleLine: false,
    selectable: true,
    referenceIndex: 2,
  },
  squareBrackets: {
    name: "square brackets",
    defaultSpokenForm: "box",
    delimiters: ["[", "]"],
    matchingDelimiters: ["[", "]"],
    isSingleLine: false,
    selectable: true,
    referenceIndex: 5,
  },
  singleQuotes: {
    name: "single quotes",
    defaultSpokenForm: "twin",
    delimiters: ["'", "'"],
    matchingDelimiters: ["'", "'"],
    isSingleLine: true,
    languageOverrides: {
      nix: {
        matchingDelimiters: ["''", "''"],
        isSingleLine: false,
      },
    },
    selectable: true,
    referenceIndex: 1,
  },
  tripleDoubleQuotes: {
    name: "triple double quotes",
    defaultSpokenForm: "triple quad",
    delimiters: ['"""', '"""'],
    matchingDelimiters: [[], []],
    isSingleLine: false,
    languageOverrides: {
      python: {
        matchingDelimiters: ['"""', '"""'],
      },
      ruby: {
        matchingDelimiters: ["%Q(", ")"],
      },
    },
    selectable: true,
    referenceIndex: null,
    disabledByDefault: true,
    private: true,
  },
  tripleSingleQuotes: {
    name: "triple single quotes",
    defaultSpokenForm: "triple twin",
    delimiters: ["'''", "'''"],
    matchingDelimiters: [[], []],
    isSingleLine: false,
    languageOverrides: {
      python: {
        matchingDelimiters: ["'''", "'''"],
      },
    },
    selectable: true,
    referenceIndex: null,
    disabledByDefault: true,
    private: true,
  },
  tripleBacktickQuotes: {
    name: "triple backtick quotes",
    defaultSpokenForm: "triple skis",
    delimiters: ["```", "```"],
    matchingDelimiters: [[], []],
    isSingleLine: false,
    languageOverrides: {
      markdown: {
        matchingDelimiters: ["```", "```"],
      },
    },
    selectable: true,
    referenceIndex: null,
    disabledByDefault: true,
    private: true,
  },
  any: {
    name: "any",
    defaultSpokenForm: "pair",
    delimiters: null,
    matchingDelimiters: null,
    isSingleLine: false,
    selectable: true,
    referenceIndex: 11,
  },
  string: {
    name: "string",
    defaultSpokenForm: "string",
    delimiters: null,
    matchingDelimiters: null,
    isSingleLine: false,
    selectable: true,
    referenceIndex: null,
  },
  whitespace: {
    name: "space",
    defaultSpokenForm: "void",
    delimiters: [" ", " "],
    matchingDelimiters: [" ", " "],
    isSingleLine: false,
    selectable: false,
    referenceIndex: 10,
  },
  collectionBoundary: {
    name: "collection boundary",
    defaultSpokenForm: "collection boundary",
    delimiters: null,
    matchingDelimiters: null,
    isSingleLine: false,
    selectable: true,
    referenceIndex: null,
    disabledByDefault: true,
    private: true,
  },
} satisfies Record<SpeakableSurroundingPairName, PairedDelimiterReference>;
