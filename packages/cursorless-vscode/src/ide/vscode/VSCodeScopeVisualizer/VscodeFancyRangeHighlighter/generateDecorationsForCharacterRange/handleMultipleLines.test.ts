import assert = require("assert");
import { BorderStyle, DecorationStyle } from "../decorationStyle.types";
import { handleMultipleLines } from "./handleMultipleLines";
import { Range } from "@cursorless/common";

type CharacterOffsets = [number, number];

interface StyledOffsets {
  style: DecorationStyle;
  offsets: CharacterOffsets;
}

interface TestCase {
  input: CharacterOffsets[];
  expected: StyledOffsets[][];
}

const testCases: TestCase[] = [
  {
    input: [
      [0, 1],
      [0, 1],
    ],
    expected: [
      [
        {
          offsets: [0, 1],
          style: {
            left: BorderStyle.solid,
            right: BorderStyle.porous,
            top: BorderStyle.solid,
            bottom: BorderStyle.none,
          },
        },
      ],
      [
        {
          offsets: [0, 1],
          style: {
            left: BorderStyle.porous,
            right: BorderStyle.solid,
            top: BorderStyle.none,
            bottom: BorderStyle.solid,
          },
        },
      ],
    ],
  },
  {
    input: [
      [1, 2],
      [0, 1],
    ],
    expected: [
      [
        {
          offsets: [1, 2],
          style: {
            left: BorderStyle.solid,
            right: BorderStyle.porous,
            top: BorderStyle.solid,
            bottom: BorderStyle.solid,
          },
        },
      ],
      [
        {
          offsets: [0, 1],
          style: {
            left: BorderStyle.porous,
            right: BorderStyle.solid,
            top: BorderStyle.solid,
            bottom: BorderStyle.solid,
          },
        },
      ],
    ],
  },
  {
    input: [
      [1, 3],
      [0, 2],
    ],
    expected: [
      [
        {
          offsets: [1, 2],
          style: {
            left: BorderStyle.solid,
            right: BorderStyle.none,
            top: BorderStyle.solid,
            bottom: BorderStyle.none,
          },
        },
        {
          offsets: [2, 3],
          style: {
            left: BorderStyle.none,
            right: BorderStyle.porous,
            top: BorderStyle.solid,
            bottom: BorderStyle.solid,
          },
        },
      ],
      [
        {
          offsets: [0, 1],
          style: {
            left: BorderStyle.porous,
            right: BorderStyle.none,
            top: BorderStyle.solid,
            bottom: BorderStyle.solid,
          },
        },
        {
          offsets: [1, 2],
          style: {
            left: BorderStyle.none,
            right: BorderStyle.solid,
            top: BorderStyle.none,
            bottom: BorderStyle.solid,
          },
        },
      ],
    ],
  },
  {
    input: [
      [0, 0],
      [0, 0],
      [0, 0],
    ],
    expected: [
      [
        {
          offsets: [0, 0],
          style: {
            left: BorderStyle.solid,
            right: BorderStyle.porous,
            top: BorderStyle.solid,
            bottom: BorderStyle.none,
          },
        },
      ],
      [
        {
          offsets: [0, 0],
          style: {
            left: BorderStyle.porous,
            right: BorderStyle.porous,
            top: BorderStyle.porous,
            bottom: BorderStyle.none,
          },
        },
      ],
      [
        {
          offsets: [0, 0],
          style: {
            left: BorderStyle.porous,
            right: BorderStyle.solid,
            top: BorderStyle.porous,
            bottom: BorderStyle.solid,
          },
        },
      ],
    ],
  },
];

suite("handleMultipleLines", () => {
  for (const testCase of testCases) {
    test(JSON.stringify(testCase.input), () => {
      const actual = [
        ...handleMultipleLines(
          testCase.input.map(
            ([start, end], index) => new Range(index, start, index, end),
          ),
        ),
      ];
      assert.deepStrictEqual(
        actual,
        testCase.expected.flatMap((lineOffsets, index) =>
          lineOffsets.map(({ style, offsets: [start, end] }) => ({
            range: new Range(index, start, index, end),
            style,
          })),
        ),
      );
    });
  }
});
