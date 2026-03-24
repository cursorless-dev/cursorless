import * as assert from "node:assert/strict";
import { generalizedRangeContains } from "./GeneralizedRange";
import { Position } from "./Position";

suite("generalizedRangeContains", () => {
  test("character", () => {
    assert.equal(
      generalizedRangeContains(
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
    assert.equal(
      generalizedRangeContains(
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
      ),
      true,
    );
    assert.equal(
      generalizedRangeContains(
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
  });

  test("line", () => {
    assert.equal(
      generalizedRangeContains(
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
      ),
      true,
    );
    assert.equal(
      generalizedRangeContains(
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
      ),
      true,
    );
    assert.equal(
      generalizedRangeContains(
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
      ),
      false,
    );
  });

  test("mixed", () => {
    assert.equal(
      generalizedRangeContains(
        {
          type: "line",
          start: 0,
          end: 1,
        },
        {
          type: "character",
          start: new Position(0, 0),
          end: new Position(1, 1),
        },
      ),
      true,
    );
    assert.equal(
      generalizedRangeContains(
        {
          type: "line",
          start: 0,
          end: 0,
        },
        {
          type: "character",
          start: new Position(0, 0),
          end: new Position(1, 0),
        },
      ),
      false,
    );
    assert.equal(
      generalizedRangeContains(
        {
          type: "character",
          start: new Position(0, 0),
          end: new Position(2, 0),
        },
        {
          type: "line",
          start: 1,
          end: 1,
        },
      ),
      true,
    );
    assert.equal(
      generalizedRangeContains(
        {
          type: "character",
          start: new Position(0, 0),
          end: new Position(1, 0),
        },
        {
          type: "line",
          start: 1,
          end: 1,
        },
      ),
      false,
    );
  });
});
