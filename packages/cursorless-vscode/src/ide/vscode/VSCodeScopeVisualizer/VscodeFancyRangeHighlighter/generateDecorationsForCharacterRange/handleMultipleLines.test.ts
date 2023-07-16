import assert = require("assert");
import { BorderStyle } from "../decorationStyle.types";
import { handleMultipleLines } from "./handleMultipleLines";
import { Range } from "@cursorless/common";
import { map } from "itertools";

const solid = BorderStyle.solid;
const porous = BorderStyle.porous;
const none = BorderStyle.none;

type CharacterOffsets = [number, number];

type Input = [CharacterOffsets, ...number[]];

type LineDecorations = [
  number,
  CharacterOffsets,
  [BorderStyle, BorderStyle, BorderStyle, BorderStyle],
];

interface TestCase {
  /**
   * The input to `handleMultipleLines`, in the format
   *
   * ```
   * [[firstLineStart, firstLineEnd], ...restLineEnds]
   * ```
   *
   * We use a single number for lines after the first because they always start
   * at character 0.  The first line will have line number 0, and the rest will
   * count up from there.
   */
  input: Input;

  /**
   * Each entry in this array is a list of expected highlights for a single
   * line, each in the format
   *
   * ```
   * [lineNumber, [start, end], [top, right, bottom, left]
   * ```
   */
  expected: LineDecorations[];
}

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
  {
    input: [[2, 3], 1],
    expected: [
      [0, [2, 3], [solid, porous, solid, solid]],
      [1, [0, 1], [solid, solid, solid, porous]],
    ],
  },
  {
    input: [[1, 3], 4, 2],
    expected: [
      [0, [1, 3], [solid, porous, none, solid]],

      [1, [0, 1], [solid, none, none, porous]],
      [1, [1, 2], [none, none, none, none]],
      [1, [2, 3], [none, none, solid, none]],
      [1, [3, 4], [porous, porous, solid, none]],

      [2, [0, 2], [none, solid, solid, porous]],
    ],
  },
  {
    input: [[0, 2], 1],
    expected: [
      [0, [0, 1], [solid, none, none, solid]],
      [0, [1, 2], [solid, porous, solid, none]],
      [1, [0, 1], [none, solid, solid, porous]],
    ],
  },
  {
    input: [[0, 2], 1, 0],
    expected: [
      [0, [0, 1], [solid, none, none, solid]],
      [0, [1, 2], [solid, porous, porous, none]],
      [1, [0, 1], [none, porous, solid, porous]],
      [2, [0, 0], [none, solid, solid, porous]],
    ],
  },
];

suite("handleMultipleLines", () => {
  for (const testCase of testCases) {
    test(JSON.stringify(testCase.input), () => {
      const [firstLine, ...rest] = testCase.input;

      const actual: LineDecorations[] = map(
        handleMultipleLines([
          new Range(0, firstLine[0], 0, firstLine[1]),
          ...rest.map((end, index) => new Range(index + 1, 0, index + 1, end)),
        ]),
        ({ range, style }) => [
          range.start.line,
          [range.start.character, range.end.character],
          [style.top, style.right, style.bottom, style.left],
        ],
      );

      assert.deepStrictEqual(actual, testCase.expected);
    });
  }
});
