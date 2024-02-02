import assert from "assert";
import { isGeneralizedRangeEqual } from "./GeneralizedRange";
import { Position } from "./Position";

suite("isGeneralizedRangeEqual", () => {
  test("character", () => {
    assert.strictEqual(
      isGeneralizedRangeEqual(
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
      ),
      true,
    );
    assert.strictEqual(
      isGeneralizedRangeEqual(
        {
          type: "character",
          start: new Position(0, 0),
          end: new Position(0, 0),
        },
        {
          type: "character",
          start: new Position(0, 0),
          end: new Position(0, 1),
        },
      ),
      false,
    );
    assert.strictEqual(
      isGeneralizedRangeEqual(
        {
          type: "character",
          start: new Position(0, 0),
          end: new Position(0, 0),
        },
        {
          type: "character",
          start: new Position(0, 0),
          end: new Position(1, 0),
        },
      ),
      false,
    );
    assert.strictEqual(
      isGeneralizedRangeEqual(
        {
          type: "character",
          start: new Position(0, 0),
          end: new Position(0, 0),
        },
        {
          type: "character",
          start: new Position(0, 1),
          end: new Position(0, 0),
        },
      ),
      false,
    );
  });

  test("line", () => {
    assert.strictEqual(
      isGeneralizedRangeEqual(
        { type: "line", start: 0, end: 0 },
        { type: "line", start: 0, end: 0 },
      ),
      true,
    );
    assert.strictEqual(
      isGeneralizedRangeEqual(
        { type: "line", start: 0, end: 0 },
        { type: "line", start: 0, end: 1 },
      ),
      false,
    );
    assert.strictEqual(
      isGeneralizedRangeEqual(
        { type: "line", start: 0, end: 0 },
        { type: "line", start: 1, end: 0 },
      ),
      false,
    );
  });

  test("mixed", () => {
    assert.strictEqual(
      isGeneralizedRangeEqual(
        {
          type: "character",
          start: new Position(0, 0),
          end: new Position(0, 0),
        },
        { type: "line", start: 0, end: 0 },
      ),
      false,
    );
    assert.strictEqual(
      isGeneralizedRangeEqual(
        { type: "line", start: 0, end: 0 },
        {
          type: "character",
          start: new Position(0, 0),
          end: new Position(0, 0),
        },
      ),
      false,
    );
  });
});
