import * as assert from "assert";
import { TokenHatSplittingMode } from "../../typings/Types";
import { getTokenLexemes } from "../../util/addDecorationsToEditor";

/**
 * Compact representation of Alex seem to make the tests easier to read.
 * Expected to be of the form
 * [text, tokenStartOffset, tokenEndOffset]
 */
type CompactLexeme = [string, number, number];

interface TestCase {
  input: string;
  expectedOutput: CompactLexeme[];
}

interface SplittingModeTestCases {
  tokenHatSplittingMode: TokenHatSplittingMode;
  testCases: TestCase[];
}

const tests: SplittingModeTestCases[] = [
  {
    tokenHatSplittingMode: { preserveCase: false, removeAccents: false },
    testCases: [
      {
        input: "Hi",
        expectedOutput: [
          ["h", 0, 1],
          ["i", 1, 2],
        ],
      },
      {
        input: "_",
        expectedOutput: [["_", 0, 1]],
      },
    ],
  },
  {
    tokenHatSplittingMode: { preserveCase: true, removeAccents: false },
    testCases: [
      {
        input: "Hi",
        expectedOutput: [
          ["H", 0, 1],
          ["i", 1, 2],
        ],
      },
      {
        input: "_",
        expectedOutput: [["_", 0, 1]],
      },
    ],
  },
  {
    tokenHatSplittingMode: { preserveCase: true, removeAccents: true },
    testCases: [
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
      {
        input: "_",
        expectedOutput: [["_", 0, 1]],
      },
    ],
  },
  {
    tokenHatSplittingMode: { preserveCase: false, removeAccents: true },
    testCases: [
      {
        input: "\u00D1", // Ñ as single codepoint
        expectedOutput: [["n", 0, 1]],
      },
      {
        input: "\u004E\u0303", // Ñ using combining mark
        expectedOutput: [["n", 0, 2]],
      },
      {
        input: "_",
        expectedOutput: [["_", 0, 1]],
      },
    ],
  },
];

tests.forEach(({ tokenHatSplittingMode, testCases }) => {
  suite(`getTokenLexemes(${JSON.stringify(tokenHatSplittingMode)})`, () => {
    testCases.forEach(({ input, expectedOutput: compactExpectedOutput }) => {
      const expectedOutput = compactExpectedOutput.map(
        ([text, tokenStartOffset, tokenEndOffset]) => ({
          text,
          tokenStartOffset,
          tokenEndOffset,
        })
      );

      const actualOutput = getTokenLexemes(input, tokenHatSplittingMode);

      test(input, () => {
        assert.deepStrictEqual(actualOutput, expectedOutput);
      });
    });
  });
});
