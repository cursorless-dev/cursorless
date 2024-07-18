import * as assert from "assert";
import { maxByAllowingTies } from "./maxByFirstDiffering";

// known good but slow
function goldenMaxByAllowingTies<T>(arr: T[], fn: (item: T) => number): T[] {
  const max = Math.max(...arr.map(fn));
  return arr.filter((item) => fn(item) === max);
}

suite("maxByFirstDiffering", () => {
  test("maxByAllowingTies", () => {
    const testCases: number[][] = [
      [],
      [0],
      [1],
      [-Infinity],
      [+Infinity],
      [0, 0],
      [0, 1],
      [1, 0],
      [-Infinity, -Infinity],
      [-Infinity, +Infinity],
      [+Infinity, -Infinity],
      [+Infinity, 0],
      [0, +Infinity],
      [-Infinity, 0],
      [0, -Infinity],
      [0, 1, 0, 1],
      [1, 0, 1, 0],
      [0, 1, 1, 0],
      [1, 0, 0, 1],
    ];

    testCases.forEach((testCase) => {
      const actual = maxByAllowingTies(testCase, (x) => x);
      const expected = goldenMaxByAllowingTies(testCase, (x) => x);
      assert.deepStrictEqual(actual, expected);
    });
  });
});
