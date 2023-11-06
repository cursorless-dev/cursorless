import assert = require("assert");
import { GeneralizedRange, generalizedRangeTouches, Position } from "..";

suite("generalizedRangeTouches", () => {
  test("character", () => {
    testRangePair(
      {
        type: "character",
        start: new Position(0, 0),
        end: new Position(0, 0),
      },
      {
        type: "character",
        start: new Position(0, 0),
        end: new Position(0, 0),
      },
      true,
    );
    testRangePair(
      {
        type: "character",
        start: new Position(0, 0),
        end: new Position(0, 1),
      },
      {
        type: "character",
        start: new Position(0, 0),
        end: new Position(0, 0),
      },
      true,
    );
    testRangePair(
      {
        type: "character",
        start: new Position(0, 0),
        end: new Position(0, 1),
      },
      {
        type: "character",
        start: new Position(0, 1),
        end: new Position(0, 2),
      },
      true,
    );
    testRangePair(
      {
        type: "character",
        start: new Position(0, 0),
        end: new Position(0, 0),
      },
      {
        type: "character",
        start: new Position(0, 1),
        end: new Position(0, 1),
      },
      false,
    );
  });

  test("line", () => {
    testRangePair(
      {
        type: "line",
        start: 0,
        end: 0,
      },
      {
        type: "line",
        start: 0,
        end: 0,
      },
      true,
    );
    testRangePair(
      {
        type: "line",
        start: 0,
        end: 1,
      },
      {
        type: "line",
        start: 0,
        end: 0,
      },
      true,
    );
    testRangePair(
      {
        type: "line",
        start: 0,
        end: 0,
      },
      {
        type: "line",
        start: 1,
        end: 1,
      },
      false,
    );
  });

  test("mixed", () => {
    testRangePair(
      {
        type: "line",
        start: 0,
        end: 0,
      },
      {
        type: "character",
        start: new Position(0, 0),
        end: new Position(1, 1),
      },
      true,
    );
    testRangePair(
      {
        type: "line",
        start: 0,
        end: 0,
      },
      {
        type: "character",
        start: new Position(1, 0),
        end: new Position(1, 1),
      },
      false,
    );
  });
});

function testRangePair(
  a: GeneralizedRange,
  b: GeneralizedRange,
  expected: boolean,
) {
  assert.strictEqual(generalizedRangeTouches(a, b), expected);
  assert.strictEqual(generalizedRangeTouches(b, a), expected);
}
