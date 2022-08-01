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

interface TestCase {
  input: string;
  expectedOutput: CompactGrapheme[];
}

interface SplittingModeTestCases {
  tokenHatSplittingMode: Partial<TokenHatSplittingMode>;
  extraTestCases: TestCase[];
}

const commonTestCases: TestCase[] = [
  {
    input: "hi",
    expectedOutput: [
      ["h", 0, 1],
      ["i", 1, 2],
    ],
  },
  {
    input: "_",
    expectedOutput: [["_", 0, 1]],
  },
  {
    input: "😄",
    expectedOutput: [[UNKNOWN, 0, 2]],
  },
];

const tests: SplittingModeTestCases[] = [
  {
    tokenHatSplittingMode: {
      preserveAccents: true,
    },
    extraTestCases: [
      {
        input: "\u00F1", // ñ as single codepoint
        expectedOutput: [["\u00F1", 0, 1]],
      },
      {
        input: "\u006E\u0303", // ñ using combining mark
        expectedOutput: [["\u00F1", 0, 2]],
      },
      {
        input: "\u00D1", // Ñ as single codepoint
        expectedOutput: [["\u00F1", 0, 1]],
      },
      {
        input: "\u004E\u0303", // Ñ using combining mark
        expectedOutput: [["\u00F1", 0, 2]],
      },
      {
        input: "Hi",
        expectedOutput: [
          ["h", 0, 1],
          ["i", 1, 2],
        ],
      },
    ],
  },
  {
    tokenHatSplittingMode: {
      preserveCase: true,
      preserveAccents: true,
    },
    extraTestCases: [
      {
        input: "\u00F1", // ñ as single codepoint
        expectedOutput: [["\u00F1", 0, 1]],
      },
      {
        input: "\u006E\u0303", // ñ using combining mark
        expectedOutput: [["\u00F1", 0, 2]],
      },
      {
        input: "\u00D1", // Ñ as single codepoint
        expectedOutput: [["\u00D1", 0, 1]],
      },
      {
        input: "\u004E\u0303", // Ñ using combining mark
        expectedOutput: [["\u00D1", 0, 2]],
      },
      {
        input: "Hi",
        expectedOutput: [
          ["H", 0, 1],
          ["i", 1, 2],
        ],
      },
    ],
  },
  {
    tokenHatSplittingMode: {
      preserveCase: true,
    },
    extraTestCases: [
      {
        input: "\u00F1", // ñ as single codepoint
        expectedOutput: [["n", 0, 1]],
      },
      {
        input: "\u006E\u0303", // ñ using combining mark
        expectedOutput: [["n", 0, 2]],
      },
      {
        input: "\u00D1", // Ñ as single codepoint
        expectedOutput: [["N", 0, 1]],
      },
      {
        input: "\u004E\u0303", // Ñ using combining mark
        expectedOutput: [["N", 0, 2]],
      },
    ],
  },
  {
    tokenHatSplittingMode: {},
    extraTestCases: [
      {
        input: "\u00F1", // ñ as single codepoint
        expectedOutput: [["n", 0, 1]],
      },
      {
        input: "\u006E\u0303", // ñ using combining mark
        expectedOutput: [["n", 0, 2]],
      },
      {
        input: "\u00D1", // Ñ as single codepoint
        expectedOutput: [["n", 0, 1]],
      },
      {
        input: "\u004E\u0303", // Ñ using combining mark
        expectedOutput: [["n", 0, 2]],
      },
    ],
  },
  {
    tokenHatSplittingMode: {
      accentsToPreserve: ["\u00e4", "\u00e5"], // äå, NFC-normalised
    },
    extraTestCases: [
      {
        input: "\u00F1", // ñ as single codepoint
        expectedOutput: [["n", 0, 1]],
      },
      {
        input: "\u006E\u0303", // ñ using combining mark
        expectedOutput: [["n", 0, 2]],
      },
      {
        input: "\u00D1", // Ñ as single codepoint
        expectedOutput: [["n", 0, 1]],
      },
      {
        input: "\u004E\u0303", // Ñ using combining mark
        expectedOutput: [["n", 0, 2]],
      },
      {
        input: "\u00e4\u00e5", // äå, NFC-normalised
        expectedOutput: [
          ["\u00e4", 0, 1], // ä, NFC-normalised
          ["\u00e5", 1, 2], // å, NFC-normalised
        ],
      },
      {
        input: "\u0061\u0308\u0061\u030a", // äå, NFD-normalised
        expectedOutput: [
          ["\u00e4", 0, 2], // ä, NFC-normalised
          ["\u00e5", 2, 4], // å, NFC-normalised
        ],
      },
      {
        input: "\u00c4\u00c5", // ÄÅ, NFC-normalised
        expectedOutput: [
          ["\u00e4", 0, 1], // ä, NFC-normalised
          ["\u00e5", 1, 2], // å, NFC-normalised
        ],
      },
      {
        input: "\u0041\u0308\u0041\u030a", // ÄÅ, NFD-normalised
        expectedOutput: [
          ["\u00e4", 0, 2], // ä, NFC-normalised
          ["\u00e5", 2, 4], // å, NFC-normalised
        ],
      },
    ],
  },
  {
    tokenHatSplittingMode: {
      accentsToPreserve: ["\u0061\u0308", "\u0061\u030a"], // äå, NFD-normalised
    },
    extraTestCases: [
      {
        input: "\u00e4\u00e5", // äå, NFC-normalised
        expectedOutput: [
          ["\u00e4", 0, 1],
          ["\u00e5", 1, 2],
        ],
      },
      {
        input: "\u0061\u0308\u0061\u030a", // äå, NFD-normalised
        expectedOutput: [
          ["\u00e4", 0, 2],
          ["\u00e5", 2, 4],
        ],
      },
    ],
  },
  {
    tokenHatSplittingMode: {
      preserveCase: true,
      accentsToPreserve: ["\u00e4", "\u00e5"], // äå, NFC-normalised
    },
    extraTestCases: [
      {
        input: "\u00e4\u00e5", // äå, NFC-normalised
        expectedOutput: [
          ["\u00e4", 0, 1],
          ["\u00e5", 1, 2],
        ],
      },
      {
        input: "\u00c4\u00c5", // ÄÅ, NFC-normalised
        expectedOutput: [
          ["\u00c4", 0, 1], // Ä, NFC-normalised
          ["\u00c5", 1, 2], // Å, NFC-normalised
        ],
      },
    ],
  },
  {
    tokenHatSplittingMode: {
      accentsToPreserve: ["\u00c4", "\u00c5"], // ÄÅ, NFC-normalised
    },
    extraTestCases: [
      {
        input: "\u00e4\u00e5", // äå, NFC-normalised
        expectedOutput: [
          ["\u00e4", 0, 1], // ä, NFC-normalised
          ["\u00e5", 1, 2], // å, NFC-normalised
        ],
      },
      {
        input: "\u00c4\u00c5", // ÄÅ, NFC-normalised
        expectedOutput: [
          ["\u00e4", 0, 1], // ä, NFC-normalised
          ["\u00e5", 1, 2], // å, NFC-normalised
        ],
      },
    ],
  },
  {
    tokenHatSplittingMode: {
      symbolsToPreserve: ["🙃"],
    },
    extraTestCases: [
      {
        input: "\u00F1", // ñ as single codepoint
        expectedOutput: [["n", 0, 1]],
      },
      {
        input: "\u006E\u0303", // ñ using combining mark
        expectedOutput: [["n", 0, 2]],
      },
      {
        input: "\u00D1", // Ñ as single codepoint
        expectedOutput: [["n", 0, 1]],
      },
      {
        input: "\u004E\u0303", // Ñ using combining mark
        expectedOutput: [["n", 0, 2]],
      },
      {
        input: "🙃",
        expectedOutput: [["🙃", 0, 2]],
      },
    ],
  },
];

const graph = makeGraph({
  tokenGraphemeSplitter: (graph: Graph) => new TokenGraphemeSplitter(graph),
  ide: (graph: Graph) => new FakeIDE(graph),
} as unknown as FactoryMap<Graph>);

const tokenHatSplittingDefaults = {
  preserveCase: false,
  preserveAccents: false,
  accentsToPreserve: [],
  symbolsToPreserve: [],
};

graph.ide.configuration.mockConfiguration<TokenHatSplittingMode>(
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

    testCases.forEach(({ input, expectedOutput: compactExpectedOutput }) => {
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
