import * as assert from "assert";
import { Graph, TokenHatSplittingMode } from "../../typings/Types";
import graphFactories from "../../util/graphFactories";
import makeGraph, { FactoryMap } from "../../util/makeGraph";
import { FakeIDE } from "./fakes/ide/FakeIDE";
import { FakeConfiguration } from "./fakes/ide/VscodeConfiguration";

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
  tokenHatSplittingMode: TokenHatSplittingMode;
  testCases: TestCase[];
}

const tests: SplittingModeTestCases[] = [
  {
    tokenHatSplittingMode: { preserveCase: false, preserveAccents: true },
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
    tokenHatSplittingMode: { preserveCase: true, preserveAccents: true },
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
    tokenHatSplittingMode: { preserveCase: true, preserveAccents: false },
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
    tokenHatSplittingMode: { preserveCase: false, preserveAccents: false },
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

const graph = makeGraph({
  ...graphFactories,
  ide: (graph: Graph) => new FakeIDE(graph),
} as FactoryMap<Graph>);

const tokenGraphemeSplitter = graph.tokenGraphemeSplitter;

tests.forEach(({ tokenHatSplittingMode, testCases }) => {
  suite(`getTokenGraphemes(${JSON.stringify(tokenHatSplittingMode)})`, () => {
    (graph.ide.configuration as FakeConfiguration).mockConfiguration(
      "tokenHatSplittingMode",
      tokenHatSplittingMode
    );

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
