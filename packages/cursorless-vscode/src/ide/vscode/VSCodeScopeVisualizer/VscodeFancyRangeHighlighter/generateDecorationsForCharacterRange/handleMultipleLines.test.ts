import assert = require("assert");
import { BorderStyle, DecorationStyle } from "../decorationStyle.types";
import { handleMultipleLines } from "./handleMultipleLines";
import { Range } from "@cursorless/common";

type CharacterOffsets = [number, number];

interface StyledOffsets {
  style: DecorationStyle;
  offsets: CharacterOffsets;
}

/**
 * Compact representation of an input to `handleMultipleLines`. The first
 * element is the character offsets of the first line, and the rest are the
 * character offsets of the end of the remaining lines.  We use a single number
 * for lines after the first because they always start at character 0.
 */
type Input = [CharacterOffsets, ...number[]];

/**
 * Compact representation of the expected highlights for a single line. The
 * first element is the line number, the second is the character offsets, and
 * the third is the border styles for the top, bottom, left, and right borders
 * respectively.
 */
type LineDecorations = [
  number,
  CharacterOffsets,
  [BorderStyle, BorderStyle, BorderStyle, BorderStyle],
];

interface TestCase {
  input: Input;
  expected: LineDecorations[];
}

const solid = BorderStyle.solid;
const porous = BorderStyle.porous;
const none = BorderStyle.none;

const testCases: TestCase[] = [
  {
    input: [[0, 1], 1],
    expected: [
      [0, [0, 1], [solid, porous, none, solid]],
      [1, [0, 1], [none, solid, solid, porous]],
    ],
  },
  {
    input: [[1, 2], 1],
    expected: [
      [0, [1, 2], [solid, porous, solid, solid]],
      [1, [0, 1], [solid, solid, solid, porous]],
    ],
  },
  {
    input: [[1, 3], 2],
    expected: [
      [0, [1, 2], [solid, none, none, solid]],
      [0, [2, 3], [solid, porous, solid, none]],
      [1, [0, 1], [solid, none, solid, porous]],
      [1, [1, 2], [none, solid, solid, none]],
    ],
  },
  {
    input: [[0, 0], 0, 0],
    expected: [
      [0, [0, 0], [solid, porous, none, solid]],
      [1, [0, 0], [porous, porous, none, porous]],
      [2, [0, 0], [porous, solid, solid, porous]],
    ],
  },
];

suite("handleMultipleLines", () => {
  for (const testCase of testCases) {
    test(JSON.stringify(testCase.input), () => {
      const [firstLine, ...rest] = testCase.input;

      const actual = [
        ...handleMultipleLines([
          new Range(0, firstLine[0], 0, firstLine[1]),
          ...rest.map((end, index) => new Range(index + 1, 0, index + 1, end)),
        ]),
      ];
      assert.deepStrictEqual(
        actual,
        testCase.expected.map(
          ([lineNumber, [start, end], [top, right, bottom, left]]) => ({
            range: new Range(lineNumber, start, lineNumber, end),
            style: { top, right, bottom, left },
          }),
        ),
      );
    });
  }
});
