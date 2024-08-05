import type { TokenHatSplittingMode } from "@cursorless/common";
import * as assert from "assert";
import { unitTestSetup } from "../test/unitTestSetup";
import { TokenGraphemeSplitter, UNKNOWN } from "./tokenGraphemeSplitter";

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
      ["æ", [[UNKNOWN, 0, 1]]],
      ["Ꝏ", [[UNKNOWN, 0, 1]]],
      ["Ø", [["o", 0, 1]]],
      ["Æ", [[UNKNOWN, 0, 1]]],
      ["Σ", [[UNKNOWN, 0, 1]]],
      ["σ", [[UNKNOWN, 0, 1]]],
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
      ["æ", [[UNKNOWN, 0, 1]]],
      ["Ꝏ", [[UNKNOWN, 0, 1]]],
      ["Ø", [["O", 0, 1]]],
      ["Æ", [[UNKNOWN, 0, 1]]],
    ],
  },
  {
    tokenHatSplittingMode: {
      lettersToPreserve: [
        "\u00e4", // ä, NFC-normalised
        "\u00e5", // å, NFC-normalised
        "ꝏ",
        "ø",
        "æ",
      ],
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
      ["ꝏ", [["ꝏ", 0, 1]]],
      ["ø", [["ø", 0, 1]]],
      ["æ", [["æ", 0, 1]]],
      ["Ꝏ", [["ꝏ", 0, 1]]],
      ["Ø", [["ø", 0, 1]]],
      ["Æ", [["æ", 0, 1]]],
    ],
  },
  {
    tokenHatSplittingMode: {
      lettersToPreserve: [
        "\u0061\u0308", // ä, NFD-normalised
        "\u0061\u030a", // å, NFD-normalised
      ],
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
      lettersToPreserve: [
        "\u00e4", // ä, NFC-normalised
        "\u00e5", // å, NFC-normalised
        "ꝏ",
        "ø",
        "æ",
      ],
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
      ["ꝏ", [["ꝏ", 0, 1]]],
      ["ø", [["ø", 0, 1]]],
      ["æ", [["æ", 0, 1]]],
      ["Ꝏ", [["Ꝏ", 0, 1]]],
      ["Ø", [["Ø", 0, 1]]],
      ["Æ", [["Æ", 0, 1]]],
    ],
  },
  {
    tokenHatSplittingMode: {
      lettersToPreserve: [
        "\u00c4", // Ä, NFC-normalised
        "\u00c5", // Å, NFC-normalised
        "Ꝏ",
        "Ø",
        "Æ",
      ],
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
      ["ꝏ", [["ꝏ", 0, 1]]],
      ["ø", [["ø", 0, 1]]],
      ["æ", [["æ", 0, 1]]],
      ["Ꝏ", [["ꝏ", 0, 1]]],
      ["Ø", [["ø", 0, 1]]],
      ["Æ", [["æ", 0, 1]]],
    ],
  },
  {
    tokenHatSplittingMode: {
      symbolsToPreserve: ["🙃", "Σ", "σ"],
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
      ["Σ", [["Σ", 0, 1]]],
      ["σ", [["σ", 0, 1]]],
    ],
  },
];

const tokenHatSplittingDefaults: TokenHatSplittingMode = {
  preserveCase: false,
  lettersToPreserve: [],
  symbolsToPreserve: [],
};

tests.forEach(({ tokenHatSplittingMode, extraTestCases }) => {
  suite(`getTokenGraphemes(${JSON.stringify(tokenHatSplittingMode)})`, () => {
    unitTestSetup(({ configuration }) => {
      configuration.mockConfiguration("tokenHatSplittingMode", {
        ...tokenHatSplittingDefaults,
        ...tokenHatSplittingMode,
      });
    });

    const testCases = [...commonTestCases, ...extraTestCases];

    testCases.forEach(([input, compactExpectedOutput]) => {
      const expectedOutput = compactExpectedOutput.map(
        ([text, tokenStartOffset, tokenEndOffset]) => ({
          text,
          tokenStartOffset,
          tokenEndOffset,
        }),
      );

      const displayOutput = expectedOutput.map(({ text }) => text).join(", ");

      test(`${input} -> ${displayOutput}`, () => {
        const actualOutput = new TokenGraphemeSplitter().getTokenGraphemes(
          input,
        );
        assert.deepStrictEqual(actualOutput, expectedOutput);
      });
    });
  });
});
