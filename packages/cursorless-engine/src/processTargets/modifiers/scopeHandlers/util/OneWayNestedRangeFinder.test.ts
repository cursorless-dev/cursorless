import { Range } from "@cursorless/common";
import { OneWayNestedRangeFinder } from "./OneWayNestedRangeFinder";
import assert from "assert";

const items = [
  { range: new Range(0, 0, 0, 5) },
  { range: new Range(0, 1, 0, 4) },
  { range: new Range(0, 2, 0, 3) },
  { range: new Range(0, 6, 0, 8) },
];

suite("OneWayNestedRangeFinder", () => {
  test("getSmallestContaining 1", () => {
    const finder = new OneWayNestedRangeFinder(items);
    const actual = finder.getSmallestContaining(new Range(0, 2, 0, 2));
    assert.equal(actual?.range.toString(), new Range(0, 2, 0, 3).toString());
  });

  test("getSmallestContaining 2", () => {
    const finder = new OneWayNestedRangeFinder(items);
    const actual = finder.getSmallestContaining(new Range(0, 7, 0, 7));
    assert.equal(actual?.range.toString(), new Range(0, 6, 0, 8).toString());
  });

  test("getSmallestContaining 3", () => {
    const finder = new OneWayNestedRangeFinder(items);
    const actual = finder.getSmallestContaining(new Range(0, 0, 0, 0));
    assert.equal(actual?.range.toString(), new Range(0, 0, 0, 5).toString());
  });
});
