import assert = require("assert");
import { StyleParameters } from "./getDecorationRanges.types";
import { Position, Range } from "@cursorless/common";
import { generateDifferentiatedRanges } from "./generateDifferentiatedRanges";

type Offsets = [number, number];

interface ExpectedResult {
  styleParameters: StyleParameters<number>;
  ranges: Offsets[];
}

interface TestStyledRange {
  range: Offsets;
  style: number;
}

interface TestCase {
  name: string;
  ranges: TestStyledRange[];
  expectedDecorations: ExpectedResult[];
}

const testCases: TestCase[] = [
  {
    name: "should handle simple case",
    ranges: [
      {
        range: [0, 1],
        style: 0,
      },
    ],
    expectedDecorations: [
      {
        styleParameters: {
          style: 0,
          differentiationIndex: 0,
        },
        ranges: [[0, 1]],
      },
    ],
  },

  {
    name: "should handle adjacent ranges",
    ranges: [
      {
        range: [0, 1],
        style: 0,
      },
      {
        range: [1, 2],
        style: 0,
      },
      {
        range: [2, 3],
        style: 0,
      },
    ],
    expectedDecorations: [
      {
        styleParameters: {
          style: 0,
          differentiationIndex: 0,
        },
        ranges: [
          [0, 1],
          [2, 3],
        ],
      },
      {
        styleParameters: {
          style: 0,
          differentiationIndex: 1,
        },
        ranges: [[1, 2]],
      },
    ],
  },

  {
    name: "should handle nested ranges",
    ranges: [
      {
        range: [0, 1],
        style: 0,
      },
      {
        range: [2, 3],
        style: 0,
      },
      {
        range: [0, 3],
        style: 0,
      },
    ],
    expectedDecorations: [
      {
        styleParameters: {
          style: 0,
          differentiationIndex: 0,
        },
        ranges: [
          [0, 1],
          [2, 3],
        ],
      },
      {
        styleParameters: {
          style: 0,
          differentiationIndex: 1,
        },
        ranges: [[0, 3]],
      },
    ],
  },
];

suite("getDecorationRanges", function () {
  for (const testCase of testCases) {
    test(testCase.name, function () {
      const actualDecorations = generateDifferentiatedRanges(
        testCase.ranges.map(({ range, style }) => ({
          range: toRange(range),
          style,
        })),
        (style) => [style],
      ).map(({ styleParameters, ranges }) => ({
        styleParameters,
        ranges: ranges.map(fromRange),
      }));

      assert.deepStrictEqual(actualDecorations, testCase.expectedDecorations);
    });
  }
});

function fromRange(range: Range): Offsets {
  return [fromPosition(range.start), fromPosition(range.end)];
}

function fromPosition(position: Position): number {
  return position.character;
}

function toRange([start, end]: Offsets): Range {
  return new Range(0, start, 0, end);
}
