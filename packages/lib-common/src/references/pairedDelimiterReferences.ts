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
  index: number | null;

  /** Whether both delimiters must occur on the same line. */
  isSingleLine: boolean;

  /** The canonical delimiters used when inserting a surrounding pair. */
  delimiters: readonly [string, string] | null;

  /**
   * The delimiters recognized when finding a surrounding pair. A non-null
   * value indicates that the pair is selectable. Empty arrays indicate that
   * matching is provided by language overrides or complex-pair expansion.
   */
  matchingDelimiters:
    | readonly [IndividualDelimiterText, IndividualDelimiterText]
    | null;

  /** Language-specific overrides for matching behavior. */
  languageOverrides?: Readonly<Record<string, PairedDelimiterLanguageOverride>>;
}

export const pairedDelimiterReferences = {
  doubleQuotes: {
    name: "double quotes",
    defaultSpokenForm: "quad",
    index: 0,
    isSingleLine: true,
    delimiters: ['"', '"'],
    matchingDelimiters: ['"', '"'],
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
  },
  singleQuotes: {
    name: "single quotes",
    defaultSpokenForm: "twin",
    index: 1,
    isSingleLine: true,
    delimiters: ["'", "'"],
    matchingDelimiters: ["'", "'"],
    languageOverrides: {
      nix: {
        matchingDelimiters: ["''", "''"],
        isSingleLine: false,
      },
    },
  },
  backtickQuotes: {
    name: "backtick quotes",
    defaultSpokenForm: "skis",
    index: 2,
    isSingleLine: false,
    delimiters: ["`", "`"],
    matchingDelimiters: ["`", "`"],
  },
  parentheses: {
    name: "parentheses",
    defaultSpokenForm: "round",
    index: 3,
    isSingleLine: false,
    delimiters: ["(", ")"],
    matchingDelimiters: [["(", "$("], ")"],
  },
  curlyBrackets: {
    name: "curly brackets",
    defaultSpokenForm: "curly",
    index: 4,
    isSingleLine: false,
    delimiters: ["{", "}"],
    matchingDelimiters: [["{", "${"], "}"],
  },
  squareBrackets: {
    name: "square brackets",
    defaultSpokenForm: "box",
    index: 5,
    isSingleLine: false,
    delimiters: ["[", "]"],
    matchingDelimiters: ["[", "]"],
  },
  angleBrackets: {
    name: "angle brackets",
    defaultSpokenForm: "diamond",
    index: 6,
    isSingleLine: false,
    delimiters: ["<", ">"],
    matchingDelimiters: [
      ["</", "<"],
      [">", "/>"],
    ],
  },
  escapedDoubleQuotes: {
    name: "escaped double quotes",
    defaultSpokenForm: "escaped quad",
    index: 7,
    isSingleLine: true,
    delimiters: [String.raw`\"`, String.raw`\"`],
    matchingDelimiters: [String.raw`\"`, String.raw`\"`],
  },
  escapedSingleQuotes: {
    name: "escaped single quotes",
    defaultSpokenForm: "escaped twin",
    index: 8,
    isSingleLine: true,
    delimiters: [String.raw`\'`, String.raw`\'`],
    matchingDelimiters: [String.raw`\'`, String.raw`\'`],
  },
  escapedParentheses: {
    name: "escaped parentheses",
    defaultSpokenForm: "escaped round",
    index: 9,
    isSingleLine: false,
    delimiters: [String.raw`\(`, String.raw`\)`],
    matchingDelimiters: [String.raw`\(`, String.raw`\)`],
  },
  whitespace: {
    name: "space",
    defaultSpokenForm: "void",
    index: 10,
    isSingleLine: false,
    delimiters: [" ", " "],
    matchingDelimiters: null,
  },
  any: {
    name: "any",
    defaultSpokenForm: "pair",
    index: 11,
    isSingleLine: false,
    delimiters: null,
    matchingDelimiters: [[], []],
  },
  escapedSquareBrackets: {
    name: "escaped square brackets",
    defaultSpokenForm: "escaped box",
    index: null,
    isSingleLine: false,
    delimiters: [String.raw`\[`, String.raw`\]`],
    matchingDelimiters: [String.raw`\[`, String.raw`\]`],
  },
  tripleDoubleQuotes: {
    name: "triple double quotes",
    defaultSpokenForm: "triple quad",
    private: true,
    disabledByDefault: true,
    index: null,
    isSingleLine: false,
    delimiters: ['"""', '"""'],
    matchingDelimiters: [[], []],
    languageOverrides: {
      python: {
        matchingDelimiters: ['"""', '"""'],
      },
      ruby: {
        matchingDelimiters: ["%Q(", ")"],
      },
    },
  },
  tripleSingleQuotes: {
    name: "triple single quotes",
    defaultSpokenForm: "triple twin",
    private: true,
    disabledByDefault: true,
    index: null,
    isSingleLine: false,
    delimiters: ["'''", "'''"],
    matchingDelimiters: [[], []],
    languageOverrides: {
      python: {
        matchingDelimiters: ["'''", "'''"],
      },
    },
  },
  tripleBacktickQuotes: {
    name: "triple backtick quotes",
    defaultSpokenForm: "triple skis",
    private: true,
    disabledByDefault: true,
    index: null,
    isSingleLine: false,
    delimiters: ["```", "```"],
    matchingDelimiters: [[], []],
    languageOverrides: {
      markdown: {
        matchingDelimiters: ["```", "```"],
      },
    },
  },
  string: {
    name: "string",
    defaultSpokenForm: "string",
    index: null,
    isSingleLine: false,
    delimiters: null,
    matchingDelimiters: [[], []],
  },
  collectionBoundary: {
    name: "collection boundary",
    defaultSpokenForm: "collection boundary",
    private: true,
    disabledByDefault: true,
    index: null,
    isSingleLine: false,
    delimiters: null,
    matchingDelimiters: [[], []],
  },
} satisfies Record<SpeakableSurroundingPairName, PairedDelimiterReference>;
