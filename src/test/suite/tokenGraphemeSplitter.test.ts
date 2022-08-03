import * as assert from "assert";
import {
  TokenGraphemeSplitter,
  UNKNOWN,
} from "../../core/TokenGraphemeSplitter";
import { Graph, TokenHatSplittingMode } from "../../typings/Types";
import makeGraph, { FactoryMap } from "../../util/makeGraph";
import { FakeIDE } from "./fakes/ide/FakeIDE";

/**
 * Compact representation of a grapheme to make the tests easier to read.
 * Expected to be of the form
 * [text, tokenStartOffset, tokenEndOffset]
 */
type CompactGrapheme = [string, number, number];

/**
 * A compact representation of a test case. Expected to be of the form
 * [input, expectedOutput]
 */
type TestCase = [string, CompactGrapheme[]];

interface SplittingModeTestCases {
  tokenHatSplittingMode: Partial<TokenHatSplittingMode>;
  extraTestCases: TestCase[];
}

const commonTestCases: TestCase[] = [
  [
    "hi",
    [
      ["h", 0, 1],
      ["i", 1, 2],
    ],
  ],
  ["_", [["_", 0, 1]]],
  ["😄", [[UNKNOWN, 0, 2]]],
];

const tests: SplittingModeTestCases[] = [
  {
    tokenHatSplittingMode: {
      preserveAccents: true,
    },
    extraTestCases: [
      [
        "\u00F1", // ñ as single codepoint
        [["\u00F1", 0, 1]],
      ],
      [
        "\u006E\u0303", // ñ using combining mark
        [["\u00F1", 0, 2]],
      ],
      [
        "\u00D1", // Ñ as single codepoint
        [["\u00F1", 0, 1]],
      ],
      [
        "\u004E\u0303", // Ñ using combining mark
        [["\u00F1", 0, 2]],
      ],
      [
        "Hi",
        [
          ["h", 0, 1],
          ["i", 1, 2],
        ],
      ],
      ["ꝏ", [["ꝏ", 0, 1]]],
      ["ø", [["ø", 0, 1]]],
      ["Ꝏ", [["ꝏ", 0, 1]]],
      ["Ø", [["ø", 0, 1]]],
    ],
  },
  {
    tokenHatSplittingMode: {
      preserveCase: true,
      preserveAccents: true,
    },
    extraTestCases: [
      [
        "\u00F1", // ñ as single codepoint
        [["\u00F1", 0, 1]],
      ],
      [
        "\u006E\u0303", // ñ using combining mark
        [["\u00F1", 0, 2]],
      ],
      [
        "\u00D1", // Ñ as single codepoint
        [["\u00D1", 0, 1]],
      ],
      [
        "\u004E\u0303", // Ñ using combining mark
        [["\u00D1", 0, 2]],
      ],
      [
        "Hi",
        [
          ["H", 0, 1],
          ["i", 1, 2],
        ],
      ],
      ["ꝏ", [["ꝏ", 0, 1]]],
      ["ø", [["ø", 0, 1]]],
      ["Ꝏ", [["Ꝏ", 0, 1]]],
      ["Ø", [["Ø", 0, 1]]],
    ],
  },
  {
    tokenHatSplittingMode: {
      preserveCase: true,
    },
    extraTestCases: [
      [
        "\u00F1", // ñ as single codepoint
        [["n", 0, 1]],
      ],
      [
        "\u006E\u0303", // ñ using combining mark
        [["n", 0, 2]],
      ],
      [
        "\u00D1", // Ñ as single codepoint
        [["N", 0, 1]],
      ],
      [
        "\u004E\u0303", // Ñ using combining mark
        [["N", 0, 2]],
      ],
      ["ꝏ", [[UNKNOWN, 0, 1]]],
      ["ø", [["o", 0, 1]]],
      ["Ꝏ", [[UNKNOWN, 0, 1]]],
      ["Ø", [["O", 0, 1]]],
    ],
  },
  {
    tokenHatSplittingMode: {},
    extraTestCases: [
      [
        "\u00F1", // ñ as single codepoint
        [["n", 0, 1]],
      ],
      [
        "\u006E\u0303", // ñ using combining mark
        [["n", 0, 2]],
      ],
      [
        "\u00D1", // Ñ as single codepoint
        [["n", 0, 1]],
      ],
      [
        "\u004E\u0303", // Ñ using combining mark
        [["n", 0, 2]],
      ],
      ["ꝏ", [[UNKNOWN, 0, 1]]],
      ["ø", [["o", 0, 1]]],
      ["Ꝏ", [[UNKNOWN, 0, 1]]],
      ["Ø", [["o", 0, 1]]],
    ],
  },
  {
    tokenHatSplittingMode: {
      accentsToPreserve: ["\u00e4", "\u00e5"], // äå, NFC-normalised
    },
    extraTestCases: [
      [
        "\u00F1", // ñ as single codepoint
        [["n", 0, 1]],
      ],
      [
        "\u006E\u0303", // ñ using combining mark
        [["n", 0, 2]],
      ],
      [
        "\u00D1", // Ñ as single codepoint
        [["n", 0, 1]],
      ],
      [
        "\u004E\u0303", // Ñ using combining mark
        [["n", 0, 2]],
      ],
      [
        "\u00e4\u00e5", // äå, NFC-normalised
        [
          ["\u00e4", 0, 1], // ä, NFC-normalised
          ["\u00e5", 1, 2], // å, NFC-normalised
        ],
      ],
      [
        "\u0061\u0308\u0061\u030a", // äå, NFD-normalised
        [
          ["\u00e4", 0, 2], // ä, NFC-normalised
          ["\u00e5", 2, 4], // å, NFC-normalised
        ],
      ],
      [
        "\u00c4\u00c5", // ÄÅ, NFC-normalised
        [
          ["\u00e4", 0, 1], // ä, NFC-normalised
          ["\u00e5", 1, 2], // å, NFC-normalised
        ],
      ],
      [
        "\u0041\u0308\u0041\u030a", // ÄÅ, NFD-normalised
        [
          ["\u00e4", 0, 2], // ä, NFC-normalised
          ["\u00e5", 2, 4], // å, NFC-normalised
        ],
      ],
    ],
  },
  {
    tokenHatSplittingMode: {
      accentsToPreserve: ["\u0061\u0308", "\u0061\u030a"], // äå, NFD-normalised
    },
    extraTestCases: [
      [
        "\u00e4\u00e5", // äå, NFC-normalised
        [
          ["\u00e4", 0, 1],
          ["\u00e5", 1, 2],
        ],
      ],
      [
        "\u0061\u0308\u0061\u030a", // äå, NFD-normalised
        [
          ["\u00e4", 0, 2],
          ["\u00e5", 2, 4],
        ],
      ],
    ],
  },
  {
    tokenHatSplittingMode: {
      preserveCase: true,
      accentsToPreserve: ["\u00e4", "\u00e5"], // äå, NFC-normalised
    },
    extraTestCases: [
      [
        "\u00e4\u00e5", // äå, NFC-normalised
        [
          ["\u00e4", 0, 1],
          ["\u00e5", 1, 2],
        ],
      ],
      [
        "\u00c4\u00c5", // ÄÅ, NFC-normalised
        [
          ["\u00c4", 0, 1], // Ä, NFC-normalised
          ["\u00c5", 1, 2], // Å, NFC-normalised
        ],
      ],
    ],
  },
  {
    tokenHatSplittingMode: {
      accentsToPreserve: ["\u00c4", "\u00c5"], // ÄÅ, NFC-normalised
    },
    extraTestCases: [
      [
        "\u00e4\u00e5", // äå, NFC-normalised
        [
          ["\u00e4", 0, 1], // ä, NFC-normalised
          ["\u00e5", 1, 2], // å, NFC-normalised
        ],
      ],
      [
        "\u00c4\u00c5", // ÄÅ, NFC-normalised
        [
          ["\u00e4", 0, 1], // ä, NFC-normalised
          ["\u00e5", 1, 2], // å, NFC-normalised
        ],
      ],
    ],
  },
  {
    tokenHatSplittingMode: {
      symbolsToPreserve: ["🙃"],
    },
    extraTestCases: [
      [
        "\u00F1", // ñ as single codepoint
        [["n", 0, 1]],
      ],
      [
        "\u006E\u0303", // ñ using combining mark
        [["n", 0, 2]],
      ],
      [
        "\u00D1", // Ñ as single codepoint
        [["n", 0, 1]],
      ],
      [
        "\u004E\u0303", // Ñ using combining mark
        [["n", 0, 2]],
      ],
      ["🙃", [["🙃", 0, 2]]],
    ],
  },
];

const graph = makeGraph({
  tokenGraphemeSplitter: (graph: Graph) => new TokenGraphemeSplitter(graph),
  ide: (graph: Graph) => new FakeIDE(graph),
} as unknown as FactoryMap<Graph>);

const tokenHatSplittingDefaults: TokenHatSplittingMode = {
  preserveCase: false,
  preserveAccents: false,
  accentsToPreserve: [],
  symbolsToPreserve: [],
};

graph.ide.configuration.mockConfiguration(
  "tokenHatSplittingMode",
  tokenHatSplittingDefaults
);

const tokenGraphemeSplitter = graph.tokenGraphemeSplitter;

tests.forEach(({ tokenHatSplittingMode, extraTestCases }) => {
  suite(`getTokenGraphemes(${JSON.stringify(tokenHatSplittingMode)})`, () => {
    graph.ide.configuration.mockConfiguration("tokenHatSplittingMode", {
      ...tokenHatSplittingDefaults,
      ...tokenHatSplittingMode,
    });

    const testCases = [...commonTestCases, ...extraTestCases];

    testCases.forEach(([input, compactExpectedOutput]) => {
      const expectedOutput = compactExpectedOutput.map(
        ([text, tokenStartOffset, tokenEndOffset]) => ({
          text,
          tokenStartOffset,
          tokenEndOffset,
        })
      );

      const actualOutput = tokenGraphemeSplitter.getTokenGraphemes(input);

      test(input, () => {
        assert.deepStrictEqual(actualOutput, expectedOutput);
      });
    });
  });
});
