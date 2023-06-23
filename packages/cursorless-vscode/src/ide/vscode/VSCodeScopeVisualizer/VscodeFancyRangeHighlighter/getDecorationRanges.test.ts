import assert = require("assert");
import { getDecorationRanges } from "./getDecorationRanges";
import { DecorationStyle, DifferentiatedStyle } from "./getDecorationRanges.types";
import {
  Range,
  RangePlainObject,
  rangeToPlainObject,
} from "@cursorless/common";

interface RangeDescription {
  startLine?: number;
  endLine?: number;
  lineCharOffsets: [number, number][];
}

export interface ExpectedResult {
  styleParameters: DifferentiatedStyle<DecorationStyle>;
  ranges: RangePlainObject[];
}

interface TestCase {
  name: string;
  ranges: RangeDescription[];
  expectedDecorations: ExpectedResult[];
}

const testCases: TestCase[] = [
  {
    name: "should handle simple case",
    ranges: [
      {
        lineCharOffsets: [[0, 1]],
      },
    ],
    expectedDecorations: [
      {
        styleParameters: {
          style: {
            top: true,
            right: true,
            bottom: true,
            left: true,
          },
          differentiationIndex: 0,
        },
        ranges: [
          {
            start: {
              line: 0,
              character: 0,
            },
            end: {
              line: 0,
              character: 1,
            },
          },
        ],
      },
    ],
  },
];

suite("getDecorationRanges", function () {
  for (const testCase of testCases) {
    test(testCase.name, function () {
      const actualDecorations = getDecorationRanges(
        {
          document: {
            lineCount: testCase.ranges.length,
          },
        } as any,
        testCase.ranges.map(
          ({ startLine, endLine, lineCharOffsets }) =>
            new Range(
              startLine ?? 0,
              lineCharOffsets[0][0],
              endLine ?? 0,
              lineCharOffsets[lineCharOffsets.length - 1][1],
            ),
        ),
      );

      assert.deepStrictEqual(
        actualDecorations.map(({ styleParameters, ranges }) => ({
          styleParameters,
          ranges: ranges.map(rangeToPlainObject),
        })),

        testCase.expectedDecorations,
      );
    });
  }
});
